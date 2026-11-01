import api from './api';

export const clinicianAttentionService = {
  getNeedsAttentionList: async () => {
    const res = await api.get('/clinician/attention');
    return res.data;
  },

  acknowledgePatient: async (patientUserId) => {
    const res = await api.post(`/clinician/attention/${patientUserId}/acknowledge`);
    return res.data;
  },
};
