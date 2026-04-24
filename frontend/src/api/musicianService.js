import { api } from "./api";

export async function getMusicians(q) {
  const params = q && q.trim() ? { q: q.trim() } : {};
  const res = await api.get("/api/musicians", { params });
  return res.data;
}

export async function removeMusician(musicianId) {
  const res = await api.delete(`/api/musicians/${musicianId}`);
  return res.data;
}

export async function resetMusicianPassword(musicianId) {
  const res = await api.post(`/api/musicians/${musicianId}/reset-password`);
  return res.data;
}

export async function updateMusicianInstruments(musicianId, instrumentos) {
  const res = await api.put(`/api/musicians/${musicianId}/instruments`, instrumentos);
  return res.data;
}
