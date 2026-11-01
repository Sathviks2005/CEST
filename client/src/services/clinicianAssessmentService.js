import API from './api';

export const clinicianAssessmentService = {
  getInstruments: async () => {
    const response = await API.get('/clinician-assessments/instruments');
    return response.data;
  },

  createAssessment: async ({
    patientId,
    instrumentId,
    answers,
    extras = {},
    respondent = 'patient',
    administeredAt,
    clinicianNote = '',
  }) => {
    const response = await API.post('/clinician-assessments', {
      patientId,
      instrumentId,
      answers,
      extras,
      respondent,
      administeredAt,
      clinicianNote,
    });
    return response.data;
  },

  getPatientAssessments: async (patientId, params = {}) => {
    const response = await API.get(`/clinician-assessments/patient/${patientId}`, {
      params,
    });
    return response.data;
  },

  getAssessmentById: async (id) => {
    const response = await API.get(`/clinician-assessments/${id}`);
    return response.data;
  },

  deleteAssessment: async (id) => {
    const response = await API.delete(`/clinician-assessments/${id}`);
    return response.data;
  },
};
