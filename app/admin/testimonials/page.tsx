'use client';

import { useEffect, useState } from 'react';
import { testimonialsApi } from '@/lib/api';

interface Testimonial {
  id: string;
  content: string;
  rating: number;
  is_approved: boolean;
  user_id: string;
  users?: { full_name: string; email: string };
  created_at: string;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await testimonialsApi.getAll();
      setTestimonials(response.data || []);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await testimonialsApi.approve(id);
      alert('Testimonial approved!');
      fetchTestimonials();
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('Failed to approve testimonial.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      await testimonialsApi.delete(id);
      alert('Testimonial deleted!');
      fetchTestimonials();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete testimonial.');
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    if (filter === 'pending') return !t.is_approved;
    if (filter === 'approved') return t.is_approved;
    return true;
  });

  const pendingCount = testimonials.filter(t => !t.is_approved).length;

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Testimonials</h1>
          <p className="text-gray-500 mt-1">Review and approve donor testimonials</p>
        </div>
        {pendingCount > 0 && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            {pendingCount} pending review
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Testimonials List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No testimonials found
          </div>
        ) : (
          filteredTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-semibold">
                    {testimonial.users?.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{testimonial.users?.full_name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500">{testimonial.users?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    testimonial.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {testimonial.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4">"{testimonial.content}"</p>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm text-gray-500">
                  {new Date(testimonial.created_at).toLocaleDateString()}
                </span>
                <div className="flex gap-3">
                  {!testimonial.is_approved && (
                    <button
                      onClick={() => handleApprove(testimonial.id)}
                      className="text-green-600 hover:underline text-sm font-medium"
                    >
                      ✓ Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}