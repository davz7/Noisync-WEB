package com.noisync.backend.dto;

import java.time.Instant;

public record BandResponse(
        Long bandId,
        String nombre,
        String descripcion,
        Instant fechaCreacion,
        Long leaderUserId
) {}
