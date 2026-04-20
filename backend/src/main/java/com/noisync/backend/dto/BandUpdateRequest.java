package com.noisync.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record BandUpdateRequest(
        @NotBlank String nombre,
        String descripcion
) {}
