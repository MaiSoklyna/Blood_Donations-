'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/firebase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else {
        setError(error.message || 'Failed to send reset email');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-50 to-blue-50 py-12 px-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">🩸</span>
            <span className="font-bold text-2xl text-gray-900">BloodConnect</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h1>
          <p className="text-gray-500">Enter your email to receive a reset link</p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </p>
            <Link href="/login" className="btn-primary">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email Address</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <Link href="/login" className="btn-secondary w-full text-center">
              Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}