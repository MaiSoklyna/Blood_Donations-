import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://borejak-backend.vercel.app';

// Main API client with auth interceptor
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('app_token');
    
    // Only add token for non-auth endpoints
    if (token && config.headers && !config.url?.includes('/auth/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('⚠️ API Error:', error.config?.url, error.message);
    
    if (error.response?.status === 401) {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      if (!path.includes('/login') && !path.includes('/complete-profile')) {
        localStorage.removeItem('app_token');
        localStorage.removeItem('user_data');
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// ============ AUTH API ============
export const authApi = {
  login: async (idToken: string) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/login`,
      { idToken },
      { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
    );
    return response.data;
  },
};

// ============ PROFILE API ============
export const profileApi = {
  getMe: async () => {
    const response = await apiClient.get('/api/profile');
    return response.data;
  },
  update: async (data: object) => {
    const response = await apiClient.put('/api/profile', data);
    return response.data;
  },
};

// ============ HOSPITALS API ============
export const hospitalsApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/hospitals');
    return response.data; // Returns { success: true, data: [...] }
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/hospitals/${id}`);
    return response.data;
  },
  create: async (data: object) => {
    const response = await apiClient.post('/api/hospitals', data);
    return response.data;
  },
  update: async (id: string, data: object) => {
    const response = await apiClient.put(`/api/hospitals/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/hospitals/${id}`);
    return response.data;
  },
};

// ============ EVENTS API ============
export const eventsApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/events');
    return response.data; // Returns { success: true, data: [...] }
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/events/${id}`);
    return response.data;
  },
  create: async (data: object) => {
    const response = await apiClient.post('/api/events', data);
    return response.data;
  },
  update: async (id: string, data: object) => {
    const response = await apiClient.put(`/api/events/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/events/${id}`);
    return response.data;
  },
  register: async (eventId: string) => {
    const response = await apiClient.post(`/api/events/${eventId}/register`);
    return response.data;
  },
};

// ============ BLOOD MARKET API ============
export const bloodMarketApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/blood-market');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/blood-market/${id}`);
    return response.data;
  },
  create: async (data: object) => {
    const response = await apiClient.post('/api/blood-market', data);
    return response.data;
  },
  update: async (id: string, data: object) => {
    const response = await apiClient.put(`/api/blood-market/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/blood-market/${id}`);
    return response.data;
  },
};

// ============ TIPS API ============
export const tipsApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/tips');
    return response.data;
  },
  create: async (data: object) => {
    const response = await apiClient.post('/api/tips', data);
    return response.data;
  },
  update: async (id: string, data: object) => {
    const response = await apiClient.put(`/api/tips/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/tips/${id}`);
    return response.data;
  },
};

// ============ TESTIMONIALS API ============
export const testimonialsApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/testimonials');
    return response.data;
  },
  create: async (data: object) => {
    const response = await apiClient.post('/api/testimonials', data);
    return response.data;
  },
  approve: async (id: string) => {
    const response = await apiClient.put(`/api/testimonials/${id}/approve`);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/testimonials/${id}`);
    return response.data;
  },
};

// ============ BENEFITS API ============
export const benefitsApi = {
  getMyBenefits: async () => {
    const response = await apiClient.get('/api/benefits/me');
    return response.data;
  },
};

// ============ NEWSLETTER API ============
export const newsletterApi = {
  subscribe: async (email: string) => {
    const response = await apiClient.post('/api/newsletter', { email });
    return response.data;
  },
};