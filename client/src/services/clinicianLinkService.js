import API from './api';

const notifyLinkChanged = (payload) => {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent('cest:clinician-link-updated', { detail: payload }));
    } catch {}
  }
};

export const clinicianLinkService = {
  // Common notifications
  getCounts: async () => {
    const response = await API.get('/clinician-links/counts');
    return response.data;
  },

  // Self-user operations
  getClinicians: async () => {
    const response = await API.get('/clinician-links/clinicians');
    return response.data;
  },

  createLink: async ({
    clinicianId,
    assessmentId = null,
    sharedAssessmentIds = [],
    shareScope = 'selected',
    alertOnHighestBand = false,
  }) => {
    const response = await API.post('/clinician-links', {
      clinicianId,
      assessmentId,
      sharedAssessmentIds,
      shareScope,
      alertOnHighestBand,
    });
    notifyLinkChanged(response.data);
    return response.data;
  },

  getMyLinks: async () => {
    const response = await API.get('/clinician-links/mine');
    return response.data;
  },

  acceptInvite: async (linkId, { shareScope = 'selected', sharedAssessmentIds = [], alertOnHighestBand = false }) => {
    const response = await API.patch(`/clinician-links/${linkId}/accept-invite`, {
      shareScope,
      sharedAssessmentIds,
      alertOnHighestBand,
    });
    notifyLinkChanged(response.data);
    return response.data;
  },

  declineInvite: async (linkId) => {
    const response = await API.patch(`/clinician-links/${linkId}/decline-invite`);
    notifyLinkChanged(response.data);
    return response.data;
  },

  updateSharing: async (linkId, { shareScope, sharedAssessmentIds, alertOnHighestBand }) => {
    const response = await API.patch(`/clinician-links/${linkId}/sharing`, {
      shareScope,
      sharedAssessmentIds,
      alertOnHighestBand,
    });
    notifyLinkChanged(response.data);
    return response.data;
  },

  cancelLink: async (linkId) => {
    const response = await API.patch(`/clinician-links/${linkId}/cancel`);
    notifyLinkChanged(response.data);
    return response.data;
  },

  revokeLink: async (linkId) => {
    const response = await API.patch(`/clinician-links/${linkId}/revoke`);
    notifyLinkChanged(response.data);
    return response.data;
  },

  // Clinician operations
  invitePatient: async ({ email, message = '' }) => {
    const response = await API.post('/clinician-links/invite', { email, message });
    return response.data;
  },

  getInvites: async () => {
    const response = await API.get('/clinician-links/invites');
    return response.data;
  },

  cancelInvite: async (linkId) => {
    const response = await API.patch(`/clinician-links/invites/${linkId}/cancel`);
    notifyLinkChanged(response.data);
    return response.data;
  },

  getClinicianRequests: async (status = 'pending') => {
    const response = await API.get(`/clinician-links/requests?status=${status}`);
    return response.data;
  },

  acceptRequest: async (linkId, clinicianNote = '') => {
    const response = await API.patch(`/clinician-links/${linkId}/accept`, { clinicianNote });
    notifyLinkChanged(response.data);
    return response.data;
  },

  declineRequest: async (linkId, clinicianNote = '') => {
    const response = await API.patch(`/clinician-links/${linkId}/decline`, { clinicianNote });
    notifyLinkChanged(response.data);
    return response.data;
  },

  getPatientAssessments: async (patientUserId) => {
    const response = await API.get(`/clinician-links/patients/${patientUserId}/assessments`);
    return response.data;
  },

  getAccessLogs: async () => {
    const response = await API.get('/clinician-links/access-logs');
    return response.data;
  },
};
