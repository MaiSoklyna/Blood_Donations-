'use client';


import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';

export default function AdminBloodRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://borejak-backend.vercel.app';

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/blood-market`);
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result || [];
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load blood requests');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      let token = localStorage.getItem('app_token');
      
      if (user) {
        const firebaseToken = await user.getIdToken(true);
        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firebaseToken }),
        });
        if (loginRes.ok) {
          const data = await loginRes.json();
          token = data.token;
          localStorage.setItem('app_token', token);
        }
      }

      const response = await fetch(`${API_URL}/api/blood-market/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        alert('✅ Listing deleted!');
        fetchRequests();
      } else {
        alert('❌ Failed to delete');
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Blood Market</h1>
          <p className="text-gray-500">Manage blood requests and offers</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-red-600">{requests.length}</p>
          <p className="text-sm text-gray-500">Total Listings</p>
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
      ) : requests.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl shadow-sm">
          <span className="text-4xl block mb-4">🩸</span>
          <p className="text-gray-500">No blood listings found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(item.type)}`}>
                    {item.type === 'request' ? '🩸 Need' : '💉 Offer'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getUrgencyColor(item.urgency)}`}>
                    {item.urgency}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-red-600">{item.blood_type}</span>
                  </div>
                  <div>
                    <p className="font-medium">{item.users?.full_name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500">{item.location}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{item.description}</p>

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{item.quantity_ml} ml</span>
                  <span>{item.status}</span>
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 flex justify-end">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}