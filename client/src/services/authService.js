import API from './api';

export const authService = {
  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    return response.data;
  },

  googleLogin: async (credential, role) => {
    const response = await API.post('/auth/google', { credential, role });
    return response.data;
  },

  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },

  getMe: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await API.put(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await API.post('/auth/verify-email', { token });
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await API.put('/users/profile', profileData);
    return response.data;
  },
};
