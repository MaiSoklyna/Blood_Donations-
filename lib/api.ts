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

// Request interceptor - add JWT token (skip for auth endpoints)
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('app_token');
    console.log('🔑 API Request:', config.method?.toUpperCase(), config.url);
    
    // Only add token for non-auth endpoints
    if (token && config.headers && !config.url?.includes('/auth/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url, error.response?.data);
    
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        // Don't redirect if on login/auth pages
        if (!path.includes('/login') && !path.includes('/complete-profile')) {
          localStorage.removeItem('app_token');
          localStorage.removeItem('user_data');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// ============ AUTH API ============
// Use direct axios call WITHOUT interceptors for login
export const authApi = {
  login: async (idToken: string) => {
    console.log('🔐 Auth login - sending idToken directly (no interceptor)');
    
    // Direct axios call - no interceptors, no Authorization header
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/login`,
      { idToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
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

  completeProfile: async (data: {
    full_name: string;
    blood_type: string;
    date_of_birth: string;
    gender: string;
    address: string;
    phone?: string;
  }) => {
    console.log('📤 Sending profile data:', data);
    const response = await apiClient.put('/api/profile', data);
    return response.data;
  },
};

// ============ HOSPITALS API ============
export const hospitalsApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/hospitals');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/hospitals/${id}`);
    return response.data;
  },
};

// ============ EVENTS API ============
export const eventsApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/events');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/api/events/${id}`);
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
  create: async (data: {
    type: 'request' | 'offer';
    blood_type: string;
    quantity_ml: number;
    urgency: string;
    location: string;
    description?: string;
  }) => {
    const response = await apiClient.post('/api/blood-market', data);
    return response.data;
  },
};

// ============ TIPS API ============
export const tipsApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/tips');
    return response.data;
  },
};

// ============ TESTIMONIALS API ============
export const testimonialsApi = {
  getAll: async () => {
    const response = await apiClient.get('/api/testimonials');
    return response.data;
  },
  create: async (data: { content: string; rating: number }) => {
    const response = await apiClient.post('/api/testimonials', data);
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