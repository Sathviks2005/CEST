import api from './api';

export const clinicianNoteService = {
  getNotes: async (patientId, page = 1, limit = 50) => {
    const res = await api.get(`/clinician-notes/patient/${patientId}`, {
      params: { page, limit },
    });
    return res.data;
  },

  createNote: async (data) => {
    const res = await api.post('/clinician-notes', data);
    return res.data;
  },

  updateNote: async (id, data) => {
    const res = await api.patch(`/clinician-notes/${id}`, data);
    return res.data;
  },

  deleteNote: async (id) => {
    const res = await api.delete(`/clinician-notes/${id}`);
    return res.data;
  },
};
