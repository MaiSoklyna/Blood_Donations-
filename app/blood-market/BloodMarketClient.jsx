'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { bloodMarketApi } from './../../lib/api';

export default function BloodMarketClient() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    type: 'request',
    blood_type: 'A+',
    quantity_ml: 450,
    urgency: 'normal',
    location: '',
    description: '',
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await bloodMarketApi.getAll();
      const data = response.data?.data || response.data || [];
      setListings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('app_token');
    if (!token) {
      alert('Please login to create a listing');
      router.push('/login');
      return;
    }

    setCreating(true);
    try {
      await bloodMarketApi.create(formData);
      alert('Listing created successfully!');
      setShowCreateModal(false);
      setFormData({
        type: 'request',
        blood_type: 'A+',
        quantity_ml: 450,
        urgency: 'normal',
        location: '',
        description: '',
      });
      fetchListings();
    } catch (error) {
      console.error('Failed to create listing:', error);
      if (error.response?.status === 401) {
        alert('Please login to create a listing');
        router.push('/login');
      } else {
        alert('Failed to create listing');
      }
    } finally {
      setCreating(false);
    }
  };

  const filteredListings = listings.filter((listing) => {
    if (filter !== 'all' && listing.type !== filter) return false;
    if (bloodTypeFilter !== 'all' && listing.blood_type !== bloodTypeFilter) return false;
    return true;
  });

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'urgent': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getTypeColor = (type) => {
    return type === 'request' ? 'bg-red-500 text-white' : 'bg-green-500 text-white';
  };

  const timeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    return Math.floor(seconds / 86400) + ' days ago';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Blood Market</h1>
              <p className="text-red-100">Request or offer blood donations in your area</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50"
            >
              + Create Listing
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              {['all', 'request', 'offer'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    filter === type ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'request' ? '🩸 Requests' : '💉 Offers'}
                </button>
              ))}
            </div>
            <select
              value={bloodTypeFilter}
              onChange={(e) => setBloodTypeFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Blood Types</option>
              {bloodTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <span className="text-4xl block mb-4">🩸</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-500 mb-4">Be the first to create a listing!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Create Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(listing.type)}`}>
                      {listing.type === 'request' ? '🩸 Need Blood' : '💉 Offering'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(listing.urgency)}`}>
                      {listing.urgency}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-red-600">{listing.blood_type}</span>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Quantity</p>
                      <p className="font-semibold text-gray-900">{listing.quantity_ml} ml</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>📍</span>
                      <span className="text-sm">{listing.location || 'Not specified'}</span>
                    </div>
                    {listing.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">{listing.description}</p>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-xs text-gray-500">{timeAgo(listing.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create Listing</h2>
            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="request"
                      checked={formData.type === 'request'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                    <span>🩸 I need blood</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="offer"
                      checked={formData.type === 'offer'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                    <span>💉 I can donate</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type *</label>
                  <select
                    value={formData.blood_type}
                    onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {bloodTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (ml)</label>
                  <input
                    type="number"
                    value={formData.quantity_ml}
                    onChange={(e) => setFormData({ ...formData, quantity_ml: parseInt(e.target.value) || 450 })}
                    min={100}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency *</label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  placeholder="e.g., Phnom Penh"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Additional details..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}