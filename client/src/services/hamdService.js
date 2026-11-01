import API from './api';

export const hamdService = {
  submitHamD: async ({ patientName, patientId, itemScores, notes }) => {
    const response = await API.post('/hamd', {
      patientName,
      patientId,
      itemScores,
      notes,
    });
    return response.data;
  },

  getMyHamdAssessments: async () => {
    const response = await API.get('/hamd/my');
    return response.data;
  },

  getHamdById: async (id) => {
    const response = await API.get(`/hamd/${id}`);
    return response.data;
  },
};
