import api from './api';

export const clinicianReportService = {
  getAvailableData: async (patientId, params = {}) => {
    const res = await api.get(`/clinician/reports/patient/${patientId}/available`, {
      params,
    });
    return res.data;
  },

  getPatientReport: async (patientId, params = {}) => {
    // Supports either query object or legacy (range, includeNotes)
    const queryParams = typeof params === 'object' ? params : { range: params };
    const res = await api.get(`/clinician/reports/patient/${patientId}`, {
      params: queryParams,
    });
    return res.data;
  },
};
