import API from './api';

export const assessmentService = {
  submitPHQ9: async ({ answers, functionalResponse }) => {
    const response = await API.post('/assessments', { answers, functionalResponse });
    return response.data;
  },

  submitGAD7: async ({ answers }) => {
    const response = await API.post('/gad7/submit', { answers });
    return response.data;
  },

  submitADHD: async ({ answers }) => {
    const response = await API.post('/adhd/submit', { answers });
    return response.data;
  },

  submitOCD: async ({ answers }) => {
    const response = await API.post('/ocd/submit', { answers });
    return response.data;
  },

  submitPTSD: async ({ answers }) => {
    const response = await API.post('/ptsd/submit', { answers });
    return response.data;
  },

  submitInsomnia: async ({ answers }) => {
    const response = await API.post('/insomnia/submit', { answers });
    return response.data;
  },

  getCooldownStatus: async (disorderSlug = 'depression') => {
    try {
      const response = await API.get(`/assessments/cooldown-status/${disorderSlug}`);
      return response.data;
    } catch (err) {
      // Offline fallback: check latest assessment from getMyAssessments or localStorage
      try {
        const myRes = await API.get('/assessments/my');
        const list = myRes.data?.data || [];
        const matches = list.filter(
          (a) =>
            (a.disorderSlug && a.disorderSlug.toLowerCase() === disorderSlug.toLowerCase()) ||
            (a.assessmentType && a.assessmentType.toLowerCase().includes(disorderSlug.toLowerCase()))
        );

        if (matches.length === 0) {
          return {
            success: true,
            data: {
              canTakeAssessment: true,
              isLocked: false,
              lastCompletedAt: null,
              nextAvailableAt: null,
              daysRemaining: 0,
              latestAssessment: null,
            },
          };
        }

        matches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const latest = matches[0];
        const completedAt = new Date(latest.createdAt || Date.now());
        const nextAvailableAt = new Date(completedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
        const now = new Date();
        const isLocked = now.getTime() < nextAvailableAt.getTime();
        const daysRemaining = isLocked
          ? Math.max(1, Math.ceil((nextAvailableAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        return {
          success: true,
          data: {
            canTakeAssessment: !isLocked,
            isLocked,
            lastCompletedAt: completedAt.toISOString(),
            nextAvailableAt: nextAvailableAt.toISOString(),
            daysRemaining,
            latestAssessment: latest,
          },
        };
      } catch (innerErr) {
        return {
          success: true,
          data: {
            canTakeAssessment: true,
            isLocked: false,
            lastCompletedAt: null,
            nextAvailableAt: null,
            daysRemaining: 0,
            latestAssessment: null,
          },
        };
      }
    }
  },

  getMyAssessments: async () => {
    const response = await API.get('/assessments/my');
    return response.data;
  },

  getById: async (id) => {
    const response = await API.get(`/assessments/${id}`);
    return response.data;
  },
};
