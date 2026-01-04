'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://borejak-backend.vercel.app';

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const getFreshToken = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return localStorage.getItem('app_token');
      
      const firebaseToken = await user.getIdToken(true);
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('app_token', data.token);
          return data.token;
        }
      }
      return localStorage.getItem('app_token');
    } catch {
      return localStorage.getItem('app_token');
    }
  };

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const token = await getFreshToken();
      const response = await fetch(`${API_URL}/api/newsletter`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result || [];
        setSubscribers(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        setError('Unauthorized - Need admin role in database');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load subscribers');
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
          <p className="text-gray-500">Manage email subscribers</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-red-600">{subscribers.length}</p>
          <p className="text-sm text-gray-500">Total Subscribers</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl shadow-sm">
          <span className="text-4xl block mb-4">📧</span>
          <p className="text-gray-500">No subscribers yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscribers.map((sub, index) => (
                <tr key={sub.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{sub.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      sub.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {sub.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}