'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://borejak-backend.vercel.app';

  useEffect(() => {
    fetchUsers();
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await getFreshToken();
      const response = await fetch(`${API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result || [];
        setUsers(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        setError('Unauthorized - Need admin role in database');
      } else if (response.status === 403) {
        setError('Forbidden - Admin access required');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load users');
    }
    setLoading(false);
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const token = await getFreshToken();
      const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        alert('✅ Role updated!');
        fetchUsers();
      } else {
        alert('❌ Failed to update role');
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Users</h1>
          <p className="text-gray-500">View and manage user accounts</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-red-600">{users.length}</p>
          <p className="text-sm text-gray-500">Total Users</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
          <p className="text-sm text-red-500 mt-2">
            Ask backend developer to set your role to admin in the database.
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl shadow-sm">
          <span className="text-4xl block mb-4">👥</span>
          <p className="text-gray-500">No users found or access denied</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{user.full_name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">{user.phone_number}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      {user.blood_type || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role || 'user'}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
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
