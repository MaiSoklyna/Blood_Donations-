'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signInWithGoogle } from '@/lib/firebase';
import { authApi } from '@/lib/api';

// 👇 ADD YOUR ADMIN EMAILS HERE
const ADMIN_EMAILS = [
  'nadrayoky001@gmail.com',     // Your email from earlier screenshot
  'nadrayoky000@gmail.com',
];

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('app_token');
    const userData = localStorage.getItem('user_data');
    
    console.log('🔍 Login page - token:', !!token, 'userData:', !!userData);
    
    if (token && userData) {
      window.location.replace('/dashboard');
    } else {
      setPageReady(true);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setStatus('Opening Google Sign In...');
    
    try {
      const { idToken, user: firebaseUser } = await signInWithGoogle();
      console.log('✅ Firebase auth success:', firebaseUser.email);
      
      setStatus('Connecting to server...');
      
      // Check if user is admin based on email
      const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email || '');
      console.log('👤 Is admin:', isAdmin);
      
      // Try backend auth (with 5s timeout)
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 5000)
        );
        
        const response = await Promise.race([
          authApi.login(idToken),
          timeoutPromise
        ]) as { success?: boolean; token?: string; user?: { full_name?: string; blood_type?: string; role?: string } };
        
        if (response?.success && response?.token && response?.user) {
          console.log('✅ Backend auth success');
          
          // Override role if email is in admin list
          const user = {
            ...response.user,
            role: isAdmin ? 'admin' : (response.user.role || 'user'),
          };
          
          localStorage.setItem('app_token', response.token);
          localStorage.setItem('user_data', JSON.stringify(user));
          window.location.replace('/dashboard');
          return;
        }
      } catch (e) {
        console.log('⚠️ Backend failed, using local auth');
      }
      
      // Fallback: local auth
      setStatus('Setting up your account...');
      
      const localUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        role: isAdmin ? 'admin' : 'user',  // 👈 Assign role based on email
        is_verified: firebaseUser.emailVerified,
        full_name: firebaseUser.displayName || '',
      };
      
      localStorage.setItem('app_token', idToken);
      localStorage.setItem('user_data', JSON.stringify(localUser));
      
      console.log('✅ Local auth saved, role:', localUser.role);
      
      if (localUser.full_name) {
        window.location.replace('/dashboard');
      } else {
        window.location.replace('/complete-profile');
      }
      
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error('❌ Login error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign in cancelled.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup blocked. Please allow popups.');
      } else {
        setError(error.message || 'Login failed.');
      }
      
      setLoading(false);
      setStatus('');
    }
  };

  if (!pageReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-50 to-blue-50 py-12 px-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🩸</span>
            <span className="font-bold text-2xl text-gray-900">BloodConnect</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome</h1>
          <p className="text-gray-500">Login or Register to continue</p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 border-2 border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {status && (
            <div className="p-3 bg-blue-50 text-blue-600 text-sm rounded-lg flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
              {status}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}