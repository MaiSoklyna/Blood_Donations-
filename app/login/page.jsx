'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithGoogle, isAuthenticated } from './../../lib/firebase';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState('social'); // 'social' or 'phone'
  
  // Phone OTP states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  // Setup reCAPTCHA
  const setupRecaptcha = () => {
    const auth = getAuth();
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
      });
    }
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      setupRecaptcha();
      const auth = getAuth();
      
      // Format phone number (add country code if needed)
      let formattedPhone = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        formattedPhone = '+855' + phoneNumber.replace(/^0/, ''); // Cambodia code
      }

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setShowOtpInput(true);
      alert('✅ OTP sent to ' + formattedPhone);
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(err.message || 'Failed to send OTP');
      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      const firebaseToken = await user.getIdToken(true);

      console.log('✅ Phone login successful');

      // Exchange for backend token
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://borejak-backend.vercel.app';
      
      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firebaseToken }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('app_token', data.token);
          localStorage.setItem('user_data', JSON.stringify(data.user));
          localStorage.setItem('profile_completed', String(data.profile_completed));
          
          if (data.profile_completed) {
            router.push('/dashboard');
          } else {
            router.push('/profile/complete');
          }
          return;
        }
      } catch (backendErr) {
        console.warn('Backend unavailable, using Firebase token');
      }

      // Fallback
      localStorage.setItem('app_token', firebaseToken);
      localStorage.setItem('user_data', JSON.stringify({
        phone: user.phoneNumber,
        uid: user.uid,
        role: 'user',
      }));
      router.push('/profile/complete');
      
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      
      if (result.profileCompleted) {
        router.push('/dashboard');
      } else {
        router.push('/profile/complete');
      }
    } catch (err) {
      console.error('Google login error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🩸</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">BloodConnect Cambodia</h1>
          <p className="text-gray-500 mt-2">Sign in to save lives</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Login Method Tabs */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => { setLoginMethod('social'); setShowOtpInput(false); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              loginMethod === 'social' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Social Login
          </button>
          <button
            onClick={() => setLoginMethod('phone')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              loginMethod === 'phone' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Phone & OTP
          </button>
        </div>

        {/* Social Login */}
        {loginMethod === 'social' && (
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>

            <button
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
          </div>
        )}

        {/* Phone OTP Login */}
        {loginMethod === 'phone' && (
          <div>
            {!showOtpInput ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 rounded-l-lg bg-gray-50 text-gray-500 text-sm">
                      +855
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="12 345 678"
                      required
                      className="flex-1 px-3 py-2 border rounded-r-lg focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 text-center text-2xl tracking-widest"
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    OTP sent to +855 {phoneNumber}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowOtpInput(false); setOtp(''); }}
                  className="w-full py-2 text-gray-600 hover:text-gray-900"
                >
                  Change phone number
                </button>
              </form>
            )}
          </div>
        )}

        {/* reCAPTCHA container */}
        <div id="recaptcha-container"></div>

        {/* Terms */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By signing in, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  );
}