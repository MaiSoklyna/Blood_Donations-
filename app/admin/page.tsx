'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { hospitalsApi, eventsApi, bloodMarketApi, testimonialsApi } from '@/lib/api';

interface Stats {
  hospitals: number;
  events: number;
  bloodRequests: number;
  testimonials: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    hospitals: 0,
    events: 0,
    bloodRequests: 0,
    testimonials: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [hospitalsRes, eventsRes, bloodMarketRes, testimonialsRes] = await Promise.allSettled([
          hospitalsApi.getAll(),
          eventsApi.getAll(),
          bloodMarketApi.getAll(),
          testimonialsApi.getAll(),
        ]);

        setStats({
          hospitals: hospitalsRes.status === 'fulfilled' ? (hospitalsRes.value?.data?.length || hospitalsRes.value?.length || 0) : 0,
          events: eventsRes.status === 'fulfilled' ? (eventsRes.value?.data?.length || eventsRes.value?.length || 0) : 0,
          bloodRequests: bloodMarketRes.status === 'fulfilled' ? (bloodMarketRes.value?.data?.length || bloodMarketRes.value?.length || 0) : 0,
          testimonials: testimonialsRes.status === 'fulfilled' ? (testimonialsRes.value?.data?.length || testimonialsRes.value?.length || 0) : 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { name: 'Hospitals', value: stats.hospitals, icon: '🏥', href: '/admin/hospitals', color: 'bg-blue-500' },
    { name: 'Events', value: stats.events, icon: '📅', href: '/admin/events', color: 'bg-green-500' },
    { name: 'Blood Requests', value: stats.bloodRequests, icon: '🩸', href: '/admin/blood-requests', color: 'bg-red-500' },
    { name: 'Testimonials', value: stats.testimonials, icon: '💬', href: '/admin/testimonials', color: 'bg-purple-500' },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your BloodConnect platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl mb-4`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : stat.value}
            </p>
            <p className="text-gray-500">{stat.name}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/hospitals?action=add"
            className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl block mb-2">➕</span>
            <span className="text-sm font-medium text-gray-700">Add Hospital</span>
          </Link>
          <Link
            href="/admin/events?action=add"
            className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <span className="text-2xl block mb-2">➕</span>
            <span className="text-sm font-medium text-gray-700">Add Event</span>
          </Link>
          <Link
            href="/admin/tips?action=add"
            className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
          >
            <span className="text-2xl block mb-2">➕</span>
            <span className="text-sm font-medium text-gray-700">Add Tip</span>
          </Link>
          <Link
            href="/admin/testimonials"
            className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <span className="text-2xl block mb-2">✅</span>
            <span className="text-sm font-medium text-gray-700">Review Testimonials</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity - Placeholder */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-gray-500 text-center py-8">
          <p>Activity log will appear here</p>
          <p className="text-sm mt-2">Connect your backend to see real-time activity</p>
        </div>
      </div>
    </div>
  );
}