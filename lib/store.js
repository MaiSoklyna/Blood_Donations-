import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token) => {
    localStorage.setItem('app_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('app_token');
    localStorage.removeItem('user_data');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('app_token');
    const userStr = localStorage.getItem('user_data');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  },
}));

// Helper function to check auth from storage
export const checkAuthFromStorage = () => {
  if (typeof window === 'undefined') return { user: null, token: null };
  
  const token = localStorage.getItem('app_token');
  const userStr = localStorage.getItem('user_data');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      return { user, token, isAuthenticated: true };
    } catch (e) {
      return { user: null, token: null, isAuthenticated: false };
    }
  }
  return { user: null, token: null, isAuthenticated: false };
};

export const isProfileComplete = (user) => {
  return !!(user?.full_name && user?.blood_type);
};