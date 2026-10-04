import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject JWT token into headers if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for clean error messages
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.msg ||
      error.message ||
      'An error occurred while communicating with the server.';
    return Promise.reject(new Error(message));
  }
);

export const authService = {
  register: (data) => api.post('/api/v1/auth/register', data),
  login: (data) => api.post('/api/v1/auth/login', data),
  getMe: () => api.get('/api/v1/auth/me'),
};

export const datasetService = {
  uploadExcel: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/v1/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  },
  getFilesList: () => api.get('/api/v1/datasets'),
  getDataPreview: (fileNameOrId) =>
    api.post('/api/v1/datasets/preview', { file: fileNameOrId }),
  getDatasetById: (id) => api.get(`/api/v1/datasets/${id}`),
  deleteDataset: (filename) => api.delete(`/api/v1/datasets/${filename}`),
  cleanDataset: (filename, options) =>
    api.post(`/api/v1/datasets/${filename}/clean`, options || {}),
  getDemoDataset: () => api.get('/api/v1/datasets/demo'),
};

export const aiService = {
  query: (payload) => api.post('/api/v1/ai/query', payload),
};

export default api;
