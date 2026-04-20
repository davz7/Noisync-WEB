package com.noisync.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SongCreateRequest(
        @NotBlank String titulo,
        @NotBlank String artistaAutor,
        @NotNull Integer bpm,
         String tonoOriginal,
        @NotBlank String escalaBase,      // Ej: C, Dm, etc
        @NotBlank String visibilidad,     // PUBLIC / PRIVATE
        String coverUrl
) {}