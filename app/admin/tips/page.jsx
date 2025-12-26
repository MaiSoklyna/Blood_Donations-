'use client';

import { useEffect, useState } from 'react';
import { tipsApi } from './../../../lib/api';

export default function AdminTipsPage() {
  const [tipsList, setTipsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTip, setEditingTip] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'before',
  });

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await tipsApi.getAll();
      console.log('✅ Tips response:', response.data);
      
      // API returns { success: true, data: [...] }
      const data = response.data?.data || response.data || [];
      setTipsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Fetch tips error:', err);
      setError('Failed to load tips');
      setTipsList([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingTip) {
        await tipsApi.update(editingTip.id, formData);
        alert('✅ Tip updated!');
      } else {
        await tipsApi.create(formData);
        alert('✅ Tip created!');
      }
      setShowModal(false);
      setEditingTip(null);
      setFormData({ title: '', content: '', category: 'before' });
      fetchTips();
    } catch (err) {
      console.error('❌ Save error:', err);
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message;
      
      if (status === 401) {
        setError('Unauthorized - Please login again');
        alert('❌ Session expired. Please login again.');
      } else if (status === 403) {
        setError('Forbidden - Admin access required');
        alert('❌ You need admin privileges to do this.');
      } else {
        setError(message);
        alert(`❌ Error: ${message}`);
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this tip?')) return;

    try {
      await tipsApi.delete(id);
      alert('✅ Tip deleted!');
      fetchTips();
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      alert(`❌ Error: ${message}`);
    }
  };

  const getCategoryColor = (cat) => ({
    before: 'bg-blue-100 text-blue-700',
    during: 'bg-yellow-100 text-yellow-700',
    after: 'bg-green-100 text-green-700',
    general: 'bg-gray-100 text-gray-700',
  }[cat] || 'bg-gray-100 text-gray-700');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Tips</h1>
        <button
          onClick={() => {
            setEditingTip(null);
            setFormData({ title: '', content: '', category: 'before' });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          + Add Tip
        </button>
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
      ) : tipsList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No tips found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tipsList.map((tip) => (
            <div key={tip.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(tip.category)}`}>
                    {tip.category}
                  </span>
                  {tip.is_published && (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      Published
                    </span>
                  )}
                </div>
                <h3 className="font-bold mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-3">{tip.content}</p>
              </div>
              <div className="px-4 py-3 bg-gray-50 flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setEditingTip(tip);
                    setFormData({
                      title: tip.title,
                      content: tip.content,
                      category: tip.category,
                    });
                    setShowModal(true);
                  }}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(tip.id)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editingTip ? 'Edit' : 'Add'} Tip</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="before">Before Donation</option>
                  <option value="during">During Donation</option>
                  <option value="after">After Donation</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
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