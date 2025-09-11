import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any global headers if needed in the future
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('sessionId');
      localStorage.removeItem('username');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Session API
export const sessionAPI = {
  create: (username) => api.post('/sessions', { username }),
  get: (sessionId) => api.get(`/sessions/${sessionId}`),
  updateActivity: (sessionId) => api.put(`/sessions/${sessionId}/activity`),
  end: (sessionId) => api.delete(`/sessions/${sessionId}`),
};

// Document API
export const documentAPI = {
  create: (title, content, username) => 
    api.post('/docs', { title, content, username }),
  
  getAll: (username) => 
    api.get('/docs', { params: { username } }),
  
  getById: (docId, username) => 
    api.get(`/docs/${docId}`, { params: { username } }),
  
  update: (docId, updates, username) => 
    api.put(`/docs/${docId}`, { ...updates, username }),
  
  delete: (docId, username) => 
    api.delete(`/docs/${docId}`, { params: { username } }),
};

export default api;
