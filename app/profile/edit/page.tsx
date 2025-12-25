'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Sidebar from '@/components/layout/Sidebar';
import LoadingSpinner from '@/components/ui/Loading';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const genders = ['male', 'female', 'other'];

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    blood_type: '',
    gender: '',
    address: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        blood_type: user.blood_type || '',
        gender: user.gender || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setSuccess(false);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.blood_type) newErrors.blood_type = 'Blood type is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSuccess(false);

    try {
      // Update local store (backend endpoint not available yet)
      updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        blood_type: formData.blood_type,
        gender: formData.gender,
        address: formData.address,
      });

      setSuccess(true);
      
      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Profile update error:', err);
      setErrors({ submit: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-500 mt-1">Update your personal information</p>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl">
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.full_name ? 'border-red-500' : 'border-gray-200'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="+855 12 345 678"
                />
              </div>

              {/* Blood Type & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="blood_type"
                    value={formData.blood_type}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      errors.blood_type ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select blood type</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.blood_type && <p className="text-red-500 text-sm mt-1">{errors.blood_type}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      errors.gender ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select gender</option>
                    {genders.map(g => (
                      <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>
                    ))}
                  </select>
                  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your address"
                />
              </div>

              {/* Success Message */}
              {success && (
                <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                  <span>✅</span>
                  <span>Profile updated successfully! Redirecting...</span>
                </div>
              )}

              {/* Error Message */}
              {errors.submit && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
