import API from './api';

export const patientService = {
  createPatient: async (data) => {
    const response = await API.post('/patients', data);
    return response.data;
  },

  getMyPatients: async () => {
    const response = await API.get('/patients/my');
    return response.data;
  },

  getPatientById: async (id) => {
    const response = await API.get(`/patients/${id}`);
    return response.data;
  },
};
