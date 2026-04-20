import { api } from "./api";

export async function getSongs(page = 0, size = 8, visibility = "") {
    const res = await api.get("/api/songs", {
        params: { page, size, visibility: visibility || undefined, visibility: visibility || undefined }
    });
    return res.data;
}
 
export async function getSong(id) {
const res = await api.get(`/api/songs/${id}`);
    return res.data;
}

export async function createSong(data) {
    const res = await api.post("/api/songs", data);
    return res.data;
}

export async function updateSong(id, data) {
    const res = await api.put(`/api/songs/${id}`, data);
    return res.data;
}

export async function deleteSong(id) {
    const res = await api.delete(`/api/songs/${id}`); 
    return res.data;
}

export async function getSections(songId) {
    const res = await api.get(`/api/songs/${songId}/sections`);
    return res.data;
}

export async function createSection(songId, data) {
    const res = await api.post(`/api/songs/${songId}/sections`, data);
    return res.data;
}

export async function updateSection(sectionId, data) {
    const res = await api.put(`/api/sections/${sectionId}`, data);
    return res.data;
}

export async function deleteSection(sectionId) {
    const res = await api.delete(`/api/sections/${sectionId}`);
    return res.data;
}

export async function getPublicSongs(page = 0, size = 8, q = "") {
    const res = await api.get("/api/songs/public", {
        params: { page, size, q: q || undefined }
    });
    return res.data;
}

export async function getPublicSong(id) {
    const res = await api.get(`/api/songs/public/${id}`);
    return res.data;
}

export async function getPublicSections(id) {
    const res = await api.get(`/api/songs/public/${id}/sections`);
    return res.data;
}
export async function toggleVisibility(id) {
    const res = await api.patch(`/api/songs/${id}/visibility`);
    return res.data;
}