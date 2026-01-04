'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { firebaseSignOut, isAdmin } from './../../lib/firebase';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if logged in and is admin
    const token = localStorage.getItem('app_token');
    const userData = localStorage.getItem('user_data');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Check if admin
    if (!isAdmin()) {
      alert('⛔ Access denied. Admin privileges required.');
      router.push('/dashboard');
      return;
    }
    
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser({ email: 'Admin' });
      }
    }
    
    setAuthorized(true);
    setLoading(false);
  }, [router]);

  const handleLogout = async () => {
    try {
      await firebaseSignOut();
    } catch (e) {
      console.error(e);
    }
    localStorage.clear();
    router.push('/login');
  };

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: '🏠' },
    { href: '/admin/hospitals', label: 'Hospitals', icon: '🏥' },
    { href: '/admin/events', label: 'Events', icon: '📅' },
    { href: '/admin/tips', label: 'Tips', icon: '💡' },
    { href: '/admin/testimonials', label: 'Testimonials', icon: '💬' },
    { href: '/admin/blood-requests', label: 'Blood Requests', icon: '🩸' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
  ];

  const isActive = (href) => pathname === href;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🩸</span>
            <span className="font-bold text-xl text-red-600">BloodConnect</span>
          </Link>
          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded mt-2 inline-block">
            Admin Panel
          </span>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b bg-gray-50">
            <p className="text-sm font-medium text-gray-900 truncate">{user.full_name || user.displayName || 'Admin'}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded mt-1 inline-block">
              {user.role || 'admin'}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {adminLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(link.href)
                      ? 'bg-red-50 text-red-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Back to User View */}
          <div className="mt-6 pt-6 border-t">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <span>👤</span>
              <span>User Dashboard</span>
            </Link>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}