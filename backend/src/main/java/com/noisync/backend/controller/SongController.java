package com.noisync.backend.controller;

import com.noisync.backend.dto.PageResponse;
import com.noisync.backend.dto.SectionResponse;
import com.noisync.backend.dto.SongCreateRequest;
import com.noisync.backend.dto.SongResponse;
import com.noisync.backend.dto.SongUpdateRequest;
import com.noisync.backend.service.SongService;
import com.noisync.backend.service.SongSectionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/songs")
public class SongController {

    private final SongService songService;
    private final SongSectionService songSectionService;

    public SongController(SongService songService, SongSectionService songSectionService) {
        this.songService = songService;
        this.songSectionService = songSectionService;
    }

    private Long bandId(Authentication auth) {
        @SuppressWarnings("unchecked")
        Map<String, Object> details = (Map<String, Object>) auth.getDetails();
        return ((Number) details.get("bandId")).longValue();
    }

    private Long userId(Authentication auth) {
        return Long.parseLong(auth.getPrincipal().toString());
    }

    private boolean isLeader(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_LEADER"));
    }

    // READ paginado (leader y musician)
    @GetMapping
    public PageResponse<SongResponse> list(
            @RequestParam(required = false) String visibility,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        return songService.list(bandId(auth), visibility, page, size);
    }

    @GetMapping("/{id}")
    public SongResponse get(@PathVariable Long id, Authentication auth) {
        return songService.get(bandId(auth), id);
    }

    // CREATE (solo leader)
    @PostMapping
    public SongResponse create(@Valid @RequestBody SongCreateRequest req, Authentication auth) {
        if (!isLeader(auth)) throw new IllegalArgumentException("Solo un lider puede crear canciones");
        return songService.create(bandId(auth), userId(auth), req);
    }

    // UPDATE (solo leader)
    @PutMapping("/{id}")
    public SongResponse update(
            @PathVariable Long id,
            @Valid @RequestBody SongUpdateRequest req,
            Authentication auth) {
        if (!isLeader(auth)) throw new IllegalArgumentException("Solo un lider puede editar canciones");
        return songService.update(bandId(auth), userId(auth), id, req);
    }

    // DELETE (solo leader, soft delete)
    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable Long id, Authentication auth) {
        if (!isLeader(auth)) throw new IllegalArgumentException("Solo un lider puede eliminar canciones");
        songService.delete(bandId(auth), userId(auth), id);
        return Map.of("ok", true, "message", "Cancion eliminada");
    }

    @GetMapping("/public")
        public PageResponse<SongResponse> listPublic(
        @RequestParam(required = false) String q,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
        return songService.listPublic(q, page, size);
}
@GetMapping("/public/{id}")
public SongResponse getPublic(@PathVariable Long id) {
    return songService.getPublic(id);
}

@GetMapping("/public/{id}/sections")
public List<SectionResponse> getSectionsPublic(@PathVariable Long id) {
    return songSectionService.listPublic(id);
}
@PatchMapping("/{id}/visibility")
public Map<String, Object> toggleVisibility(@PathVariable Long id, Authentication auth) {
    if (!isLeader(auth)) throw new IllegalArgumentException("Solo un lider puede cambiar la visibilidad");
    songService.toggleVisibility(bandId(auth), userId(auth), id);
    return Map.of("ok", true, "message", "Visibilidad actualizada");
}
}