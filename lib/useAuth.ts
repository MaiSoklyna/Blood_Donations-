'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';

export function useAuth() {
  const { user, isAuthenticated, token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check localStorage directly to avoid hydration issues
    const checkAuth = () => {
      const storedToken = localStorage.getItem('app_token');
      const storedUser = localStorage.getItem('user_data');
      
      setIsLoading(false);
      setIsReady(true);
      
      return !!(storedToken && storedUser);
    };

    // Small delay to ensure Zustand has hydrated
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // After ready, use Zustand state
  const finalAuth = isReady ? isAuthenticated : false;

  return {
    user,
    token,
    isAuthenticated: finalAuth,
    isLoading,
    isReady,
  };
}