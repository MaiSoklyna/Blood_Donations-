'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['male', 'female', 'other'];

export default function CompleteProfilePage() {
  const [loading, setLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    blood_type: '',
    gender: '',
    address: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('app_token');
    const userDataStr = localStorage.getItem('user_data');
    
    console.log('🔍 CompleteProfile - token:', !!token, 'userData:', !!userDataStr);
    
    if (!token || !userDataStr) {
      window.location.replace('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userDataStr);
      setUserEmail(user.email || '');
      setFormData(prev => ({
        ...prev,
        full_name: user.full_name || '',
      }));
      setPageReady(true);
    } catch {
      window.location.replace('/login');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userDataStr = localStorage.getItem('user_data');
    if (!userDataStr) {
      window.location.replace('/login');
      return;
    }

    const existingUser = JSON.parse(userDataStr);
    const updatedUser = {
      ...existingUser,
      ...formData,
      profile_complete: true,
    };

    localStorage.setItem('user_data', JSON.stringify(updatedUser));
    console.log('✅ Profile saved');
    
    window.location.replace('/dashboard');
  };

  if (!pageReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-red-50 to-blue-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-3xl">🩸</span>
              <span className="font-bold text-xl text-gray-900">BloodConnect</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
            {userEmail && <p className="text-sm text-green-600">✓ {userEmail}</p>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type *</label>
                <select
                  value={formData.blood_type}
                  onChange={(e) => setFormData({...formData, blood_type: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select</option>
                  {bloodTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select</option>
                  {genders.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !formData.full_name || !formData.blood_type || !formData.gender}
              className="w-full py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}