'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from './../../components/layout/Header';
import { isAdmin } from './../../lib/firebase';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    donations: 0,
    events: 0,
    level: 'bronze',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://borejak-backend.vercel.app';

  useEffect(() => {
    const token = localStorage.getItem('app_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = localStorage.getItem('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchUserStats();
    setLoading(false);
  }, [router]);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('app_token');
      
      // Fetch benefits
      const benefitsRes = await fetch(`${API_URL}/api/benefits/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (benefitsRes.ok) {
        const data = await benefitsRes.json();
        setStats(prev => ({
          ...prev,
          donations: data.data?.total_donations || data.total_donations || 0,
          level: data.data?.level || data.level || 'bronze',
        }));
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  const userMenuItems = [
    { href: '/hospitals', label: 'Find Hospitals', icon: '🏥', desc: 'Locate blood donation centers', color: 'bg-blue-500' },
    { href: '/events', label: 'Donation Events', icon: '📅', desc: 'Join blood donation events', color: 'bg-green-500' },
    { href: '/blood-market', label: 'Blood Market', icon: '🩸', desc: 'Request or offer blood', color: 'bg-red-500' },
    { href: '/benefits', label: 'My Benefits', icon: '🎁', desc: 'View rewards and perks', color: 'bg-purple-500' },
    { href: '/donations', label: 'Donation History', icon: '📋', desc: 'Track your donations', color: 'bg-orange-500' },
    { href: '/tips', label: 'Donation Tips', icon: '💡', desc: 'Prepare for donation', color: 'bg-yellow-500' },
  ];

  const getLevelIcon = (level) => {
    const icons = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎' };
    return icons[level] || '🥉';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl text-white p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome back, {user?.full_name || user?.displayName || 'Donor'}! 👋
                </h1>
                <p className="text-red-100 mt-1">{user?.email}</p>
              </div>
              
              {/* Admin Link (only show if admin) */}
              {isAdmin() && (
                <Link
                  href="/admin"
                  className="px-4 py-2 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50"
                >
                  🔧 Go to Admin Panel
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{stats.donations}</p>
                <p className="text-red-100 text-sm">Donations</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{getLevelIcon(stats.level)}</p>
                <p className="text-red-100 text-sm capitalize">{stats.level} Level</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">{user?.blood_type || '?'}</p>
                <p className="text-red-100 text-sm">Blood Type</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {userMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center text-2xl mb-4 text-white`}>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900">{item.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </Link>
            ))}
          </div>

          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
              <Link href="/profile" className="text-red-600 text-sm hover:underline">
                Edit Profile
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{user?.full_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{user?.phone_number || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Blood Type</p>
                <p className="font-medium">{user?.blood_type || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium capitalize">{user?.gender || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}