import api from './api';

export const clinicianSettingsService = {
  getSettings: async () => {
    const res = await api.get('/clinician/settings');
    return res.data;
  },

  updateSettings: async (payload) => {
    const res = await api.patch('/clinician/settings', payload);
    return res.data;
  },

  requestVerification: async () => {
    const res = await api.post('/clinician/settings/request-verification');
    return res.data;
  },
};
