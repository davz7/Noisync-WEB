package com.noisync.backend.service;

import com.noisync.backend.dto.PageResponse;
import com.noisync.backend.dto.SongCreateRequest;
import com.noisync.backend.dto.SongResponse;
import com.noisync.backend.dto.SongUpdateRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Service
public class SongService {

    private final JdbcTemplate jdbc;

    public SongService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private static final String SONG_SELECT = """
        SELECT s.song_id, s.band_id, s.titulo, s.artista_autor, s.bpm,
               s.tono_original, s.escala_base,
               s.visibilidad, s.estatus, s.cover_url,
               b.nombre AS nombre_banda,
               s.fecha_creacion, s.fecha_actualizacion,
               (SELECT COUNT(*) FROM song_section ss WHERE ss.song_id = s.song_id) AS total_secciones
        FROM song s
        JOIN band b ON b.band_id = s.band_id
    """;

    private final RowMapper<SongResponse> songMapper = (rs, rowNum) -> new SongResponse(
            rs.getLong("song_id"),
            rs.getLong("band_id"),
            rs.getString("titulo"),
            rs.getString("artista_autor"),
            rs.getInt("bpm"),
            rs.getString("tono_original"),
            rs.getString("escala_base"),
            rs.getString("visibilidad"),
            rs.getString("estatus"),
            rs.getString("cover_url"),
            rs.getString("nombre_banda"),
            toInstant(rs.getTimestamp("fecha_creacion")),
            toInstant(rs.getTimestamp("fecha_actualizacion")),
            rs.getInt("total_secciones")
    );

    private Instant toInstant(Timestamp ts) {
        return ts == null ? null : ts.toInstant();
    }

    private void validate(SongCreateRequest req) {
        if (req.bpm() == null || req.bpm() <= 0)
            throw new IllegalArgumentException("El BPM debe ser mayor a 0");

        if (!req.visibilidad().equalsIgnoreCase("PUBLIC") &&
                !req.visibilidad().equalsIgnoreCase("PRIVATE"))
            throw new IllegalArgumentException("Visibilidad invalida");

        if (req.escalaBase() == null || req.escalaBase().isBlank())
            throw new IllegalArgumentException("escalaBase es obligatoria");
    }

    private void validate(SongUpdateRequest req) {
        validate(new SongCreateRequest(
                req.titulo(),
                req.artistaAutor(),
                req.bpm(),
                req.tonoOriginal(),
                req.escalaBase(),
                req.visibilidad(),
                req.coverUrl()
        ));
    }

    // LIST (por banda)
    public PageResponse<SongResponse> list(Long bandId, String q, int page, int size) {

        int offset = page * size;

        String search = (q == null || q.isBlank()) ? "" :
                " AND (LOWER(s.titulo) LIKE ? OR LOWER(s.artista_autor) LIKE ?)";

        String sql = SONG_SELECT + """
            WHERE s.band_id = ?
              AND s.estatus = 'ACTIVO'
        """ + search + """
            ORDER BY s.fecha_creacion DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        """;

        String countSql = """
            SELECT COUNT(*)
            FROM song s
            WHERE s.band_id = ?
              AND s.estatus = 'ACTIVO'
        """ + search;

        List<SongResponse> content;
        Long total;

        if (q == null || q.isBlank()) {
            content = jdbc.query(sql, songMapper, bandId, offset, size);
            total = jdbc.queryForObject(countSql, Long.class, bandId);
        } else {
            String like = "%" + q.trim().toLowerCase() + "%";
            content = jdbc.query(sql, songMapper, bandId, like, like, offset, size);
            total = jdbc.queryForObject(countSql, Long.class, bandId, like, like);
        }

        int totalPages = (int) Math.ceil((double) total / size);

        return new PageResponse<>(content, page, size, total, totalPages, page >= totalPages - 1);
    }

    // GET
    public SongResponse get(Long bandId, Long songId) {

        List<SongResponse> res = jdbc.query(
                SONG_SELECT + """
                WHERE s.band_id = ?
                  AND s.song_id = ?
        """, songMapper, bandId, songId);

        if (res.isEmpty())
            throw new IllegalArgumentException("Canción no encontrada");

        return res.get(0);
    }

    // CREATE
    @Transactional
    public SongResponse create(Long bandId, Long userId, SongCreateRequest req) {

        validate(req);

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbc.update(connection -> {

            PreparedStatement ps = connection.prepareStatement("""
                INSERT INTO song (
                  band_id, titulo, artista_autor, bpm, tono_original, escala_base,
                  visibilidad, estatus, cover_url,
                  created_by, updated_by
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVO', ?, ?, ?)
            """, new String[]{"song_id"});

            ps.setLong(1, bandId);
            ps.setString(2, req.titulo());
            ps.setString(3, req.artistaAutor());
            ps.setInt(4, req.bpm());
            ps.setString(5, req.tonoOriginal());
            ps.setString(6, req.escalaBase());
            ps.setString(7, req.visibilidad().toUpperCase());
            ps.setString(8, req.coverUrl());
            ps.setLong(9, userId);
            ps.setLong(10, userId);

            return ps;

        }, keyHolder);

        Long songId = keyHolder.getKey().longValue();

        return get(bandId, songId);
    }

    // UPDATE
    @Transactional
    public SongResponse update(Long bandId, Long userId, Long songId, SongUpdateRequest req) {

        validate(req);

        int updated = jdbc.update("""
            UPDATE song
            SET titulo = ?,
                artista_autor = ?,
                bpm = ?,
                tono_original = ?,
                escala_base = ?,
                visibilidad = ?,
                cover_url = ?,
                fecha_actualizacion = SYSTIMESTAMP,
                updated_by = ?
            WHERE band_id = ?
              AND song_id = ?
              AND estatus = 'ACTIVO'
        """,
                req.titulo(),
                req.artistaAutor(),
                req.bpm(),
                req.tonoOriginal(),
                req.escalaBase(),
                req.visibilidad().toUpperCase(),
                req.coverUrl(),
                userId,
                bandId,
                songId
        );

        if (updated == 0)
            throw new IllegalArgumentException("Canción no encontrada");

        return get(bandId, songId);
    }

    // DELETE (soft)
    @Transactional
    public void delete(Long bandId, Long userId, Long songId) {

        int updated = jdbc.update("""
            UPDATE song
            SET estatus = 'ELIMINADO',
                updated_by = ?,
                fecha_actualizacion = SYSTIMESTAMP
            WHERE band_id = ?
              AND song_id = ?
              AND estatus = 'ACTIVO'
        """, userId, bandId, songId);

        if (updated == 0)
            throw new IllegalArgumentException("Canción no encontrada");
    }

    // LIST PUBLIC
    public PageResponse<SongResponse> listPublic(String q, int page, int size) {

        int offset = page * size;

        String search = (q == null || q.isBlank()) ? "" :
                " AND (LOWER(s.titulo) LIKE ? OR LOWER(s.artista_autor) LIKE ?)";

        String sql = SONG_SELECT + """
            WHERE s.visibilidad = 'PUBLIC'
              AND s.estatus = 'ACTIVO'
        """ + search + """
            ORDER BY s.fecha_creacion DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        """;

        String countSql = """
            SELECT COUNT(*)
            FROM song s
            WHERE s.visibilidad = 'PUBLIC'
              AND s.estatus = 'ACTIVO'
        """ + search;

        List<SongResponse> content;
        Long total;

        if (q == null || q.isBlank()) {
            content = jdbc.query(sql, songMapper, offset, size);
            total = jdbc.queryForObject(countSql, Long.class);
        } else {
            String like = "%" + q.trim().toLowerCase() + "%";
            content = jdbc.query(sql, songMapper, like, like, offset, size);
            total = jdbc.queryForObject(countSql, Long.class, like, like);
        }

        int totalPages = (int) Math.ceil((double) total / size);

        return new PageResponse<>(content, page, size, total, totalPages, page >= totalPages - 1);
    }

    // GET PUBLIC
    public SongResponse getPublic(Long songId) {

        List<SongResponse> res = jdbc.query(
                SONG_SELECT + """
                WHERE s.song_id = ?
                  AND s.visibilidad = 'PUBLIC'
                  AND s.estatus = 'ACTIVO'
        """, songMapper, songId);

        if (res.isEmpty())
            throw new IllegalArgumentException("Canción no encontrada");

        return res.get(0);
    }

    @Transactional
    public void toggleVisibility(Long bandId, Long userId, Long songId) {

        int updated = jdbc.update("""
            UPDATE song
            SET visibilidad =
                CASE WHEN visibilidad = 'PUBLIC' THEN 'PRIVATE' ELSE 'PUBLIC' END,
                updated_by = ?,
                 fecha_actualizacion = SYSTIMESTAMP
            WHERE band_id = ?
              AND song_id = ?
              AND estatus = 'ACTIVO'
        """, userId, bandId, songId);

        if (updated == 0)
            throw new IllegalArgumentException("Canción no encontrada");
    }
}
