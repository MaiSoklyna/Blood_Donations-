'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    blood_type: '',
    date_of_birth: '',
    gender: '',
    address: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Get fresh token from backend
  const getFreshToken = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('Not logged in');
      }
      
      // Get fresh Firebase token
      const firebaseToken = await user.getIdToken(true);
      
      // Exchange for backend JWT
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://borejak-backend.vercel.app';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('app_token', data.token);
          console.log('✅ Got fresh backend token');
          return data.token;
        }
      }
      
      // Fallback to firebase token
      return firebaseToken;
    } catch (err) {
      console.error('Token refresh failed:', err);
      return localStorage.getItem('app_token');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get fresh token first
      const token = await getFreshToken();
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://borejak-backend.vercel.app';
      
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        localStorage.setItem('profile_completed', 'true');
        const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
        localStorage.setItem('user_data', JSON.stringify({ ...currentUser, ...formData }));
        alert('✅ Profile completed!');
        router.push('/dashboard');
      } else if (response.status === 401) {
        // Token still invalid - save locally and continue
        console.warn('⚠️ Auth failed, saving locally');
        saveLocally();
      } else {
        throw new Error(data.message || 'Failed to save profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      
      if (err.message === 'Failed to fetch' || err.message === 'Network Error') {
        saveLocally();
        return;
      }
      
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const saveLocally = () => {
    localStorage.setItem('profile_completed', 'true');
    const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
    localStorage.setItem('user_data', JSON.stringify({ ...currentUser, ...formData }));
    alert('✅ Profile saved locally!');
    router.push('/dashboard');
  };

  const handleSkip = () => {
    localStorage.setItem('profile_completed', 'true');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🩸</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-500 mt-2">Help us personalize your experience</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              required
              placeholder="012 345 678"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type *</label>
            <select
              name="blood_type"
              value={formData.blood_type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select blood type</option>
              {BLOOD_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows={2}
              placeholder="Phnom Penh, Cambodia"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
            
            <button
              type="button"
              onClick={handleSkip}
              className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}