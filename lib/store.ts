import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  is_verified: boolean;
  full_name?: string;
  blood_type?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  phone?: string;
  profile_complete?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  login: (user: User, token: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  loadFromStorage: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token) => {
    console.log('🔐 Login:', user.email);
    localStorage.setItem('app_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    console.log('🚪 Logout');
    localStorage.removeItem('app_token');
    localStorage.removeItem('user_data');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateProfile: (data) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...data, profile_complete: true };
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },

  loadFromStorage: () => {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('app_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        console.log('✅ Loaded from storage:', user.email);
        set({ user, token, isAuthenticated: true });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  },
}));

export const isProfileComplete = (user: User | null | undefined): boolean => {
  if (!user) return false;
  return !!(user.full_name && user.blood_type);
};

// Helper to check auth from localStorage directly
export const checkAuthFromStorage = (): boolean => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('app_token');
  const userData = localStorage.getItem('user_data');
  return !!(token && userData);
};