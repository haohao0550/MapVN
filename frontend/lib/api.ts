import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Health check
export const healthCheck = () => api.get('/health');

// Auth endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/api/auth/login', credentials),
  register: (userData: { email: string; name: string; password: string }) =>
    api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/auth/profile'),
};

// Models endpoints
export const modelsAPI = {
  getAll: (params?: { page?: number; limit?: number; category?: string; search?: string }) =>
    api.get('/api/models', { params }),
  getById: (id: string) => api.get(`/api/models/${id}`),
  create: (data: FormData) => api.post('/api/models', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id: string, data: any) => api.put(`/api/models/${id}`, data),
  delete: (id: string) => api.delete(`/api/models/${id}`),
};

// Categories endpoints
export const categoriesAPI = {
  getAll: () => api.get('/api/categories'),
  getTree: () => api.get('/api/categories/tree'),
  getById: (id: string) => api.get(`/api/categories/${id}`),
  create: (data: any) => api.post('/api/categories', data),
  update: (id: string, data: any) => api.put(`/api/categories/${id}`, data),
  delete: (id: string) => api.delete(`/api/categories/${id}`),
};

// GeoJSON endpoints
export const geojsonAPI = {
  getAll: (params?: { page?: number; limit?: number; type?: string; search?: string }) =>
    api.get('/api/geojsons', { params }),
  getById: (id: string) => api.get(`/api/geojsons/${id}`),
  create: (data: any) => api.post('/api/geojsons', data),
  update: (id: string, data: any) => api.put(`/api/geojsons/${id}`, data),
  delete: (id: string) => api.delete(`/api/geojsons/${id}`),
};

// Admin endpoints
export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: () => api.get('/api/admin/users'),
};

export default api;
