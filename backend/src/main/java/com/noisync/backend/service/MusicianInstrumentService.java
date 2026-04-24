package com.noisync.backend.service;

import com.noisync.backend.dto.InstrumentResponse;
import com.noisync.backend.dto.MusicianResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MusicianInstrumentService {

    private final JdbcTemplate jdbc;

    public MusicianInstrumentService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<MusicianResponse> musicianMapper = (rs, rn) -> {

        String instrumentosStr = rs.getString("instrumentos");

        List<String> instrumentos = instrumentosStr == null
                ? List.of()
                : List.of(instrumentosStr.split(", "));

        return new MusicianResponse(
                rs.getLong("user_id"),
                rs.getLong("band_id"),
                rs.getString("nombre_completo"),
                rs.getString("correo"),
                rs.getString("username"),
                rs.getString("estatus"),
                instrumentos
        );
    };

    private final RowMapper<InstrumentResponse> instrumentMapper = (rs, rn) -> new InstrumentResponse(
            rs.getLong("instrument_id"),
            rs.getLong("band_id"),
            rs.getString("nombre"),
            rs.getInt("activo"),
            rs.getInt("total_musicos")
    );

    public List<MusicianResponse> listMusicians(Long bandId, String q) {

        if (q == null || q.trim().isEmpty()) {
            return jdbc.query("""
                SELECT 
                    u.user_id, u.band_id, p.nombre_completo, p.correo, u.username, u.estatus,
                    (SELECT LISTAGG(i2.nombre, ', ') WITHIN GROUP (ORDER BY i2.nombre)
                     FROM musician_instrument mi2
                     JOIN instrument i2 ON i2.instrument_id = mi2.instrument_id
                     WHERE mi2.user_id = u.user_id) AS instrumentos
                FROM app_user u
                JOIN person p ON p.person_id = u.person_id
                WHERE u.band_id = ? AND u.rol = 'MUSICIAN' AND u.activo = 1
                ORDER BY p.nombre_completo ASC
            """, musicianMapper, bandId);
        }

        String like = "%" + q.toLowerCase() + "%";

        return jdbc.query("""
            SELECT 
                u.user_id, u.band_id, p.nombre_completo, p.correo, u.username, u.estatus,
                (SELECT LISTAGG(i2.nombre, ', ') WITHIN GROUP (ORDER BY i2.nombre)
                 FROM musician_instrument mi2
                 JOIN instrument i2 ON i2.instrument_id = mi2.instrument_id
                 WHERE mi2.user_id = u.user_id) AS instrumentos
            FROM app_user u
            JOIN person p ON p.person_id = u.person_id
            WHERE u.band_id = ?
              AND u.rol = 'MUSICIAN'
              AND u.activo = 1
              AND (
                    LOWER(p.nombre_completo) LIKE ?
                    OR LOWER(u.username) LIKE ?
                  )
            ORDER BY p.nombre_completo ASC
        """, musicianMapper, bandId, like, like);
    }

    public List<InstrumentResponse> listMusicianInstruments(Long bandId, Long musicianId) {
        Integer ok = jdbc.queryForObject("""
            SELECT COUNT(*) FROM app_user
            WHERE user_id = ? AND band_id = ? AND rol = 'MUSICIAN'
        """, Integer.class, musicianId, bandId);

        if (ok == null || ok == 0) throw new IllegalArgumentException("Musico no encontrado");

        return jdbc.query("""
            SELECT i.instrument_id, i.band_id, i.nombre, i.activo
            FROM musician_instrument mi
            JOIN instrument i ON i.instrument_id = mi.instrument_id
            WHERE mi.user_id = ?
              AND i.band_id = ?
              AND i.activo = 1
            ORDER BY i.nombre ASC
        """, instrumentMapper, musicianId, bandId);
    }

    @Transactional
    public void assign(Long bandId, Long musicianId, Long instrumentId) {
        Integer okM = jdbc.queryForObject("""
            SELECT COUNT(*) FROM app_user
            WHERE user_id = ? AND band_id = ? AND rol = 'MUSICIAN'
        """, Integer.class, musicianId, bandId);

        if (okM == null || okM == 0) throw new IllegalArgumentException("Musico no encontrado");

        Integer okI = jdbc.queryForObject("""
            SELECT COUNT(*) FROM instrument
            WHERE instrument_id = ? AND band_id = ? AND activo = 1
        """, Integer.class, instrumentId, bandId);

        if (okI == null || okI == 0) throw new IllegalArgumentException("Instrumento no encontrado");

        jdbc.update("""
            INSERT INTO musician_instrument (user_id, instrument_id)
            VALUES (?, ?)
        """, musicianId, instrumentId);
    }

    @Transactional
    public void unassign(Long bandId, Long musicianId, Long instrumentId) {
        Integer okI = jdbc.queryForObject("""
            SELECT COUNT(*) FROM instrument
            WHERE instrument_id = ? AND band_id = ?
        """, Integer.class, instrumentId, bandId);

        if (okI == null || okI == 0) throw new IllegalArgumentException("Instrumento no encontrado");

        jdbc.update("""
            DELETE FROM musician_instrument
            WHERE user_id = ? AND instrument_id = ?
        """, musicianId, instrumentId);
    }

    @Transactional
    public void updateInstruments(Long bandId, Long musicianId, List<String> instrumentos) {
        Integer ok = jdbc.queryForObject("""
            SELECT COUNT(*) FROM app_user
            WHERE user_id = ? AND band_id = ? AND rol = 'MUSICIAN'
        """, Integer.class, musicianId, bandId);

        if (ok == null || ok == 0) throw new IllegalArgumentException("Musico no encontrado");

        jdbc.update("DELETE FROM musician_instrument WHERE user_id = ?", musicianId);

        for (String nombre : instrumentos) {
            Long instrumentId = null;
            try {
                instrumentId = jdbc.queryForObject(
                    "SELECT instrument_id FROM instrument WHERE LOWER(nombre) = LOWER(?) AND band_id = ?",
                    Long.class, nombre, bandId
                );
            } catch (Exception ignored) {}

            if (instrumentId != null) {
                jdbc.update(
                    "INSERT INTO musician_instrument (user_id, instrument_id) VALUES (?, ?)",
                    musicianId, instrumentId
                );
            }
        }
    }
}