'use client';

import { useState, useEffect } from 'react';

export default function TipsClient() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://borejak-backend.vercel.app';
      const response = await fetch(`${API_URL}/api/tips`);
      
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result || [];
        setTips(Array.isArray(data) ? data : []);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (err) {
      console.warn('⚠️ Could not fetch tips:', err.message);
      setError('Unable to connect to server');
      setTips([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTips = filter === 'all' 
    ? tips 
    : tips.filter(tip => tip.category === filter);

  const getCategoryColor = (cat) => ({
    before: 'bg-blue-100 text-blue-700',
    during: 'bg-yellow-100 text-yellow-700',
    after: 'bg-green-100 text-green-700',
    general: 'bg-gray-100 text-gray-700',
  }[cat] || 'bg-gray-100 text-gray-700');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Blood Donation Tips</h1>
          <p className="text-red-100">Helpful advice for before, during, and after your donation</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Error Banner */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-700">⚠️ {error}</p>
            <button onClick={fetchTips} className="mt-2 text-sm text-yellow-600 hover:underline">
              Try again
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'before', 'during', 'after', 'general'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === cat
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat === 'all' ? 'All Tips' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredTips.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <span className="text-4xl block mb-4">💡</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tips found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTips.map((tip) => (
              <div key={tip.id} className="bg-white rounded-xl shadow-sm p-6">
                <span className={`inline-block px-3 py-1 text-xs rounded-full mb-3 ${getCategoryColor(tip.category)}`}>
                  {tip.category}
                </span>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{tip.title}</h3>
                <p className="text-gray-600">{tip.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}