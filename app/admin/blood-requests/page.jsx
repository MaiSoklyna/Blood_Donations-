'use client';

import { useEffect, useState } from 'react';
import { bloodMarketApi } from './../../../lib/api';

export default function AdminBloodRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await bloodMarketApi.getAll();
      setRequests(response.data || []);
    } catch (error) {
      console.error('Failed to fetch blood requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      await bloodMarketApi.delete(id);
      alert('Request deleted!');
      fetchRequests();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete request.');
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filter === 'request') return r.type === 'request';
    if (filter === 'offer') return r.type === 'offer';
    return true;
  });

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'urgent': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-700';
      case 'fulfilled': return 'bg-gray-100 text-gray-700';
      case 'expired': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Blood Requests</h1>
          <p className="text-gray-500 mt-1">Manage blood donation requests and offers</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-3xl font-bold text-red-600">{requests.filter(r => r.type === 'request').length}</p>
          <p className="text-gray-500 text-sm">Blood Requests</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-3xl font-bold text-green-600">{requests.filter(r => r.type === 'offer').length}</p>
          <p className="text-gray-500 text-sm">Blood Offers</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-3xl font-bold text-orange-600">{requests.filter(r => r.urgency === 'critical').length}</p>
          <p className="text-gray-500 text-sm">Critical</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'request', 'offer'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === type
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? 'All' : type === 'request' ? 'Requests' : 'Offers'}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No blood requests found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.type === 'request' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {request.type === 'request' ? '🩸 Need' : '💉 Offer'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-red-600 text-lg">{request.blood_type}</span>
                    <span className="text-gray-500 text-sm ml-2">({request.quantity_ml}ml)</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 hidden md:table-cell">{request.location}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(request.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}