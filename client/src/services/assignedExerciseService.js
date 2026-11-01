import api from './api';

export const assignedExerciseService = {
  // Clinician routes
  getCatalog: async (patientUserId) => {
    const url = patientUserId
      ? `/assigned-exercises/catalog?patientUserId=${patientUserId}`
      : '/assigned-exercises/catalog';
    const res = await api.get(url);
    return res.data;
  },

  createAssignments: async ({ patientUserId, exerciseIds, note, dueDate }) => {
    const res = await api.post('/assigned-exercises', {
      patientUserId,
      exerciseIds,
      note,
      dueDate,
    });
    return res.data;
  },

  getPatientAssignments: async (patientUserId) => {
    const res = await api.get(`/assigned-exercises/patient/${patientUserId}`);
    return res.data;
  },

  getAllClinicianAssignments: async () => {
    const res = await api.get('/assigned-exercises/clinician/all');
    return res.data;
  },

  getClinicianCounts: async () => {
    const res = await api.get('/assigned-exercises/clinician/counts');
    return res.data;
  },

  cancelAssignment: async (id) => {
    const res = await api.patch(`/assigned-exercises/${id}/cancel`);
    return res.data;
  },

  // Patient routes
  getMyAssignments: async (status) => {
    const url = status
      ? `/assigned-exercises/mine?status=${status}`
      : '/assigned-exercises/mine';
    const res = await api.get(url);
    return res.data;
  },

  startAssignment: async (id, moodBefore) => {
    const res = await api.patch(`/assigned-exercises/${id}/start`, { moodBefore });
    return res.data;
  },

  completeAssignment: async (id, { moodBefore, moodAfter, sharedResult }) => {
    const res = await api.post(`/assigned-exercises/${id}/complete`, {
      moodBefore,
      moodAfter,
      sharedResult,
    });
    return res.data;
  },

  skipAssignment: async (id, reason) => {
    const res = await api.patch(`/assigned-exercises/${id}/skip`, { reason });
    return res.data;
  },

  getPatientCounts: async () => {
    const res = await api.get('/assigned-exercises/counts');
    return res.data;
  },
};
