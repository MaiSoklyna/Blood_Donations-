'use client';

import { useEffect, useState } from 'react';
import { tipsApi } from '@/lib/api';

interface Tip {
  id: string;
  title: string;
  content: string;
  category: 'before' | 'during' | 'after' | 'general';
  is_published: boolean;
}

export default function AdminTipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTip, setEditingTip] = useState<Tip | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as Tip['category'],
  });

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const response = await tipsApi.getAll();
      setTips(response.data || []);
    } catch (error) {
      console.error('Failed to fetch tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTip(null);
    setFormData({ title: '', content: '', category: 'general' });
    setShowModal(true);
  };

  const handleEdit = (tip: Tip) => {
    setEditingTip(tip);
    setFormData({
      title: tip.title,
      content: tip.content,
      category: tip.category,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingTip) {
        await tipsApi.update(editingTip.id, formData);
        alert('Tip updated successfully!');
      } else {
        await tipsApi.create(formData);
        alert('Tip created successfully!');
      }
      setShowModal(false);
      fetchTips();
    } catch (error) {
      console.error('Failed to save tip:', error);
      alert('Failed to save tip. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tip?')) return;

    try {
      await tipsApi.delete(id);
      alert('Tip deleted successfully!');
      fetchTips();
    } catch (error) {
      console.error('Failed to delete tip:', error);
      alert('Failed to delete tip.');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'before': return 'bg-blue-100 text-blue-700';
      case 'during': return 'bg-yellow-100 text-yellow-700';
      case 'after': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Tips</h1>
          <p className="text-gray-500 mt-1">Create helpful tips for blood donors</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
        >
          + Add Tip
        </button>
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : tips.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            <p>No tips found</p>
            <button onClick={handleAdd} className="mt-4 text-red-600 hover:underline">
              Create your first tip
            </button>
          </div>
        ) : (
          tips.map((tip) => (
            <div key={tip.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(tip.category)}`}>
                    {tip.category}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${tip.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {tip.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-3">{tip.content}</p>
              </div>
              <div className="px-6 py-3 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => handleEdit(tip)} className="text-blue-600 hover:underline text-sm">
                  Edit
                </button>
                <button onClick={() => handleDelete(tip.id)} className="text-red-600 hover:underline text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingTip ? 'Edit Tip' : 'Add Tip'}
            </h2>
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
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Tip['category'] })}
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
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editingTip ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}