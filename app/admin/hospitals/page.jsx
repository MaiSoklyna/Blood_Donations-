'use client';

import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function AdminHospitalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    is_active: true,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://borejak-backend.vercel.app';

  useEffect(() => {
    fetchHospitals();
  }, []);

  const getFreshToken = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        return localStorage.getItem('app_token');
      }
      
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
    } catch (err) {
      return localStorage.getItem('app_token');
    }
  };

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/hospitals`);
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result || [];
        setHospitals(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setHospitals([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = await getFreshToken();
      
      const url = editingHospital 
        ? `${API_URL}/api/hospitals/${editingHospital.id}`
        : `${API_URL}/api/hospitals`;
      
      const method = editingHospital ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('✅ Hospital saved!');
        setShowModal(false);
        setEditingHospital(null);
        setFormData({ name: '', address: '', phone: '', email: '', description: '', is_active: true });
        fetchHospitals();
      } else if (response.status === 401) {
        setError('Your session expired or you need admin role in the database. Please contact backend developer.');
        alert('❌ 401 Unauthorized\n\nYour database role is still "user".\n\nAsk backend developer to run:\nUPDATE users SET role = \'admin\' WHERE email = \'nadrayoky000@gmail.com\';');
      } else if (response.status === 403) {
        setError('Access denied. You need admin privileges.');
        alert('❌ 403 Forbidden - Admin access required');
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message);
      if (!err.message.includes('401') && !err.message.includes('403')) {
        alert('❌ Error: ' + err.message);
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this hospital?')) return;

    try {
      const token = await getFreshToken();
      
      const response = await fetch(`${API_URL}/api/hospitals/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        alert('✅ Hospital deleted!');
        fetchHospitals();
      } else if (response.status === 401) {
        alert('❌ 401 Unauthorized - Need admin role in database');
      } else {
        alert('❌ Failed to delete');
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const openAddModal = () => {
    setEditingHospital(null);
    setFormData({ name: '', address: '', phone: '', email: '', description: '', is_active: true });
    setShowModal(true);
  };

  const openEditModal = (hospital) => {
    setEditingHospital(hospital);
    setFormData({
      name: hospital.name || '',
      address: hospital.address || '',
      phone: hospital.phone || '',
      email: hospital.email || '',
      description: hospital.description || '',
      is_active: hospital.is_active ?? true,
    });
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Hospitals</h1>
        <button onClick={openAddModal} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          + Add Hospital
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-medium">⚠️ {error}</p>
          <p className="text-sm text-red-600 mt-2">
            Ask your backend developer to update your role in the database.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : hospitals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl block mb-4">🏥</span>
          <p>No hospitals found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hospitals.map((hospital) => (
            <div key={hospital.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{hospital.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${hospital.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {hospital.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">📍 {hospital.address}</p>
              {hospital.phone && <p className="text-gray-500 text-sm">📞 {hospital.phone}</p>}
              {hospital.email && <p className="text-gray-500 text-sm">✉️ {hospital.email}</p>}
              <div className="flex gap-2 justify-end mt-4 pt-4 border-t">
                <button onClick={() => openEditModal(hospital)} className="text-blue-600 text-sm hover:underline">Edit</button>
                <button onClick={() => handleDelete(hospital.id)} className="text-red-600 text-sm hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingHospital ? 'Edit' : 'Add'} Hospital</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}