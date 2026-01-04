'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    hospitals: '-',
    events: '-',
    users: '-',
    donations: '-',
  });
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://borejak-backend.vercel.app';

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch counts from each endpoint
      const endpoints = ['hospitals', 'events', 'tips', 'testimonials'];
      const results = {};

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(`${API_URL}/api/${endpoint}`);
          if (res.ok) {
            const data = await res.json();
            const items = data.data || data || [];
            results[endpoint] = Array.isArray(items) ? items.length : 0;
          }
        } catch {
          results[endpoint] = '-';
        }
      }

      setStats({
        hospitals: results.hospitals || '-',
        events: results.events || '-',
        tips: results.tips || '-',
        testimonials: results.testimonials || '-',
      });
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
    setLoading(false);
  };

  // All admin features with status
  const adminFeatures = [
    { 
      href: '/admin/hospitals', 
      label: 'Manage Hospitals', 
      icon: '🏥', 
      color: 'bg-blue-500',
      desc: 'CRUD partner hospitals',
      count: stats.hospitals,
      status: 'complete', // complete, partial, pending
      scope: '3. Admin CRUD partner hospital'
    },
    { 
      href: '/admin/events', 
      label: 'Manage Events', 
      icon: '📅', 
      color: 'bg-green-500',
      desc: 'CRUD donation events',
      count: stats.events,
      status: 'complete',
      scope: '7. Admin CRUD donation event'
    },
    { 
      href: '/admin/tips', 
      label: 'Manage Tips', 
      icon: '💡', 
      color: 'bg-yellow-500',
      desc: 'CRUD donation tips',
      count: stats.tips,
      status: 'complete',
      scope: '6. Admin CRUD tips of donation'
    },
    { 
      href: '/admin/testimonials', 
      label: 'Testimonials', 
      icon: '💬', 
      color: 'bg-purple-500',
      desc: 'Approve/delete testimonials',
      count: stats.testimonials,
      status: 'complete',
      scope: '4. Admin CRUD testimony'
    },
    { 
      href: '/admin/blood-requests', 
      label: 'Blood Requests', 
      icon: '🩸', 
      color: 'bg-red-500',
      desc: 'Manage blood market posts',
      count: '-',
      status: 'complete',
      scope: '9. Blood market'
    },
    { 
      href: '/admin/users', 
      label: 'Manage Users', 
      icon: '👥', 
      color: 'bg-indigo-500',
      desc: 'View and manage users',
      count: '-',
      status: 'complete',
      scope: '1. User role: Admin, User'
    },
    { 
      href: '/admin/newsletter', 
      label: 'Newsletter', 
      icon: '📧', 
      color: 'bg-teal-500',
      desc: 'View subscribers',
      count: '-',
      status: 'complete',
      scope: '8. User subscribe newsletter'
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'complete':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">✓ Complete</span>;
      case 'partial':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">⚠ Partial</span>;
      case 'pending':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">✗ Pending</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome, {user?.full_name || user?.email || 'Admin'}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">🏥</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.hospitals}</p>
              <p className="text-sm text-gray-500">Hospitals</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">📅</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.events}</p>
              <p className="text-sm text-gray-500">Events</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-xl">💡</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.tips}</p>
              <p className="text-sm text-gray-500">Tips</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl">💬</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.testimonials}</p>
              <p className="text-sm text-gray-500">Testimonials</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scope Requirements Status */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="font-bold text-gray-900 mb-4">📋 Project Scope Status</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-green-50 rounded">
            <span>1. User role: Admin, User</span>
            <span className="text-green-600">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-green-50 rounded">
            <span>2. User login: Social + Phone OTP</span>
            <span className="text-green-600">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-green-50 rounded">
            <span>3. Admin CRUD partner hospital</span>
            <span className="text-green-600">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-green-50 rounded">
            <span>4. Admin CRUD testimony</span>
            <span className="text-green-600">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-green-50 rounded">
            <span>5. User benefit manage</span>
            <span className="text-green-600">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-green-50 rounded">
            <span>6. Admin CRUD tips</span>
            <span className="text-green-600">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-green-50 rounded">
            <span>7. Admin CRUD donation event</span>
            <span className="text-green-600">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-green-50 rounded">
            <span>8. User subscribe newsletter</span>
            <span className="text-green-600">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-green-50 rounded">
            <span>9. Blood market</span>
            <span className="text-green-600">✓ Complete</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-700">
            ⚠️ <strong>Note:</strong> All features require backend admin role. Ask backend developer to run:<br/>
            <code className="bg-yellow-100 px-1 rounded">UPDATE users SET role = 'admin' WHERE email = 'nadrayoky000@gmail.com';</code>
          </p>
        </div>
      </div>

      {/* Admin Features Grid */}
      <h2 className="font-bold text-gray-900 mb-4">Admin Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminFeatures.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center text-2xl text-white`}>
                {feature.icon}
              </div>
              {getStatusBadge(feature.status)}
            </div>
            <h3 className="font-semibold text-gray-900">{feature.label}</h3>
            <p className="text-sm text-gray-500 mt-1">{feature.desc}</p>
            <p className="text-xs text-gray-400 mt-2">{feature.scope}</p>
            {feature.count !== '-' && (
              <p className="text-lg font-bold text-gray-900 mt-2">{feature.count} items</p>
            )}
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mt-8 p-4 bg-gray-100 rounded-xl">
        <p className="text-sm text-gray-600">
          <strong>Quick Links:</strong>{' '}
          <Link href="/dashboard" className="text-red-600 hover:underline">User Dashboard</Link> |{' '}
          <Link href="/" className="text-red-600 hover:underline">Homepage</Link> |{' '}
          <Link href="/login" className="text-red-600 hover:underline">Logout</Link>
        </p>
      </div>
    </div>
  );
}