package com.noisync.backend.dto;

import java.time.Instant;

public record SongResponse(
        Long songId,
        Long bandId,
        String titulo,
        String artistaAutor,
        Integer bpm,
        String tonoOriginal,
        String escalaBase,
        String visibilidad,
        String estatus,
        String coverUrl,
        String nombreBanda,
        Instant fechaCreacion,
        Instant fechaActualizacion,
        Integer totalSecciones
) {}