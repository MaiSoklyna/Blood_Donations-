'use client';

import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: Fetch from API when endpoint is available
    const currentUser = localStorage.getItem('user_data');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setUsers([{
        id: user.id || '1',
        email: user.email,
        full_name: user.full_name || 'Unknown',
        role: user.role || 'user',
        blood_type: user.blood_type,
        is_verified: user.is_verified || false,
      }]);
    }
    setLoading(false);
  }, []);

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, role: newRole } : user
    ));
    alert(`User role updated to ${newRole}!`);
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-gray-500 mt-1">View and manage user accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-3xl font-bold text-gray-900">{users.length}</p>
          <p className="text-gray-500 text-sm">Total Users</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-3xl font-bold text-red-600">{users.filter(u => u.role === 'admin').length}</p>
          <p className="text-gray-500 text-sm">Admins</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-3xl font-bold text-blue-600">{users.filter(u => u.role === 'user').length}</p>
          <p className="text-gray-500 text-sm">Regular Users</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No users found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Blood Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-semibold">
                        {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-red-600 font-medium">{user.blood_type || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border-0 cursor-pointer ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {user.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Note</h3>
        <p className="text-sm text-blue-700">
          User management requires a backend API endpoint. Currently showing logged-in user only.
        </p>
      </div>
    </div>
  );
}