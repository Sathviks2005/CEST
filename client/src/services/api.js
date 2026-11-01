import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for JWT auth token
API.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('cest_token');
      if (token && token !== 'undefined' && token !== 'null') {
        config.headers.Authorization = `Bearer ${token}`;
        // Pass user meta for offline mock tokens so the API can authorize
        if (token.startsWith('mock_jwt_token_')) {
          const savedUser = localStorage.getItem('cest_user');
          if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
            config.headers['X-Mock-User'] = savedUser;
          }
        }
      }
    } catch {
      // Ignore localStorage access failures
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
