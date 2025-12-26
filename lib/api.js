import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://borejak-backend.vercel.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add APP JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('app_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - AUTO EXTRACT DATA & Handle 401
api.interceptors.response.use(
  (response) => {
    // API returns { success: true, data: [...] }
    if (response.data && response.data.success && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized - Token expired or invalid');
      
      // Clear old tokens
      localStorage.removeItem('app_token');
      
      // Show message to user
      if (typeof window !== 'undefined') {
        const shouldRelogin = confirm('Your session has expired. Please login again.');
        if (shouldRelogin) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ============ AUTH API ============
export const authApi = {
  login: (firebaseToken) => api.post('/api/auth/login', { firebaseToken }),
};

// ============ PROFILE API ============
export const profileApi = {
  get: () => api.get('/api/profile'),
  update: (data) => api.post('/api/profile', data),
};

// ============ EVENTS API ============
export const eventsApi = {
  getAll: () => api.get('/api/events'),
  getById: (id) => api.get(`/api/events/${id}`),
  create: (data) => api.post('/api/events', data),
  update: (id, data) => api.put(`/api/events/${id}`, data),
  delete: (id) => api.delete(`/api/events/${id}`),
  register: (id) => api.post(`/api/events/${id}/register`),
};

// ============ HOSPITALS API ============
export const hospitalsApi = {
  getAll: () => api.get('/api/hospitals'),
  getById: (id) => api.get(`/api/hospitals/${id}`),
  create: (data) => api.post('/api/hospitals', data),
  update: (id, data) => api.put(`/api/hospitals/${id}`, data),
  delete: (id) => api.delete(`/api/hospitals/${id}`),
};

// ============ DONATIONS API ============
export const donationsApi = {
  getMine: () => api.get('/api/donations/me'),
  getAll: () => api.get('/api/donations'),
  updateStatus: (id, data) => api.put(`/api/donations/${id}/status`, data),
};

// ============ BENEFITS API ============
export const benefitsApi = {
  getMine: () => api.get('/api/benefits/me'),
};

// ============ BLOOD MARKET API ============
export const bloodMarketApi = {
  getAll: (params) => api.get('/api/blood-market', { params }),
  create: (data) => api.post('/api/blood-market', data),
  close: (id) => api.post(`/api/blood-market/${id}/close`),
  delete: (id) => api.delete(`/api/blood-market/${id}`),
};

// ============ TIPS API ============
export const tipsApi = {
  getAll: () => api.get('/api/tips'),
  create: (data) => api.post('/api/tips', data),
  update: (id, data) => api.put(`/api/tips/${id}`, data),
  delete: (id) => api.delete(`/api/tips/${id}`),
};

// ============ TESTIMONIALS API ============
export const testimonialsApi = {
  getAll: () => api.get('/api/testimonials'),
  create: (data) => api.post('/api/testimonials', data),
  approve: (id) => api.put(`/api/testimonials/admin/${id}/approve`),
  delete: (id) => api.delete(`/api/testimonials/${id}`),
};

// ============ NEWSLETTER API ============
export const newsletterApi = {
  subscribe: (email) => api.post('/api/newsletter/subscribe', { email }),
  unsubscribe: (email) => api.post('/api/newsletter/unsubscribe', { email }),
  getAll: () => api.get('/api/newsletter'),
};

// ============ USERS API (Admin) ============
export const usersApi = {
  getAll: () => api.get('/api/users'),
  updateRole: (id, role) => api.put(`/api/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/api/users/${id}`),
};

export default api;