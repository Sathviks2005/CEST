import api from './api';

export const adminService = {
  getPendingRequests: async () => {
    const res = await api.get('/admin/clinicians/pending');
    return res.data;
  },

  getReviewedHistory: async (params = {}) => {
    const res = await api.get('/admin/clinicians/reviewed', { params });
    return res.data;
  },

  approveClinician: async (id) => {
    const res = await api.patch(`/admin/clinicians/${id}/approve`);
    return res.data;
  },

  rejectClinician: async (id, reason) => {
    const res = await api.patch(`/admin/clinicians/${id}/reject`, { reason });
    return res.data;
  },
};

