'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminMenuItems = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Hospitals', href: '/admin/hospitals', icon: '🏥' },
  { name: 'Events', href: '/admin/events', icon: '📅' },
  { name: 'Tips', href: '/admin/tips', icon: '💡' },
  { name: 'Testimonials', href: '/admin/testimonials', icon: '💬' },
  { name: 'Blood Requests', href: '/admin/blood-requests', icon: '🩸' },
  { name: 'Users', href: '/admin/users', icon: '👥' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('app_token');
    const userDataStr = localStorage.getItem('user_data');

    if (!token || !userDataStr) {
      window.location.replace('/login');
      return;
    }

    try {
      const user = JSON.parse(userDataStr);
      // Check if user is admin
      if (user.role !== 'admin') {
        console.log('❌ Not an admin, redirecting...');
        window.location.replace('/dashboard');
        return;
      }
      setIsAdmin(true);
      setIsAuthed(true);
    } catch {
      window.location.replace('/login');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('app_token');
    localStorage.removeItem('user_data');
    window.location.replace('/login');
  };

  if (!isAuthed || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🩸</span>
          <span className="font-bold text-gray-900">Admin Panel</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-gray-900 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform z-40`}>
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-2xl">🩸</span>
            <div>
              <span className="font-bold text-lg">BloodConnect</span>
              <span className="block text-xs text-gray-400">Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {adminMenuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.href
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg">
            <span>👤</span>
            <span>User Dashboard</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}