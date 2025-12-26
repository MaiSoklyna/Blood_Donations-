'use client';

import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // Check localStorage directly
    const token = localStorage.getItem('app_token');
    const userData = localStorage.getItem('user_data');
    
    console.log('🛡️ ProtectedRoute: Checking auth...');
    console.log('🛡️ ProtectedRoute: token exists:', !!token);
    console.log('🛡️ ProtectedRoute: user_data exists:', !!userData);
    
    if (!token || !userData) {
      console.log('❌ ProtectedRoute: No auth, redirecting to login');
      window.location.href = '/login';
      return;
    }
    
    // Auth exists
    console.log('✅ ProtectedRoute: Auth valid, showing content');
    setIsAuthed(true);
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthed) {
    return null;
  }

  return <>{children}</>;
}