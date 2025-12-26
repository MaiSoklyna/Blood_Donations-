'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { hospitalsApi, eventsApi, bloodMarketApi, testimonialsApi } from './../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    hospitals: 0,
    events: 0,
    bloodRequests: 0,
    testimonials: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const results = await Promise.allSettled([
        hospitalsApi.getAll(),
        eventsApi.getAll(),
        bloodMarketApi.getAll(),
        testimonialsApi.getAll(),
      ]);

      setStats({
        hospitals: results[0].status === 'fulfilled' ? (results[0].value.data?.length || 0) : 0,
        events: results[1].status === 'fulfilled' ? (results[1].value.data?.length || 0) : 0,
        bloodRequests: results[2].status === 'fulfilled' ? (results[2].value.data?.length || 0) : 0,
        testimonials: results[3].status === 'fulfilled' ? (results[3].value.data?.length || 0) : 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Hospitals', value: stats.hospitals, icon: '🏥', href: '/admin/hospitals', color: 'bg-blue-500' },
    { label: 'Events', value: stats.events, icon: '📅', href: '/admin/events', color: 'bg-green-500' },
    { label: 'Blood Requests', value: stats.bloodRequests, icon: '🩸', href: '/admin/blood-requests', color: 'bg-red-500' },
    { label: 'Testimonials', value: stats.testimonials, icon: '💬', href: '/admin/testimonials', color: 'bg-purple-500' },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your BloodConnect platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                {stat.icon}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? (
                <span className="inline-block w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin"></span>
              ) : (
                stat.value
              )}
            </p>
            <p className="text-gray-500 text-sm">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/hospitals"
            className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">➕</span>
            <span className="text-sm font-medium text-gray-700">Add Hospital</span>
          </Link>
          <Link
            href="/admin/events"
            className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">📅</span>
            <span className="text-sm font-medium text-gray-700">Create Event</span>
          </Link>
          <Link
            href="/admin/tips"
            className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">💡</span>
            <span className="text-sm font-medium text-gray-700">Add Tip</span>
          </Link>
          <Link
            href="/admin/users"
            className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">👥</span>
            <span className="text-sm font-medium text-gray-700">Manage Users</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl block mb-2">📊</span>
          <p>Activity tracking coming soon</p>
        </div>
      </div>
    </div>
  );
}