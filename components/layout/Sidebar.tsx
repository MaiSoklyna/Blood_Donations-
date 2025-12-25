'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/donations', label: 'My Donations', icon: '💉' },
  { href: '/events', label: 'Events', icon: '📅' },
  { href: '/blood-market', label: 'Blood Market', icon: '🩸' },
  { href: '/tips', label: 'Tips', icon: '💡' },
  { href: '/hospitals', label: 'Hospitals', icon: '🏥' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 z-50 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🩸</span>
          <span className="font-bold text-white">BloodConnect</span>
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`bg-gray-900 text-white min-h-screen w-64 fixed left-0 top-0 z-40 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 py-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🩸</span>
            <span className="font-bold text-xl">BloodConnect</span>
          </Link>
        </div>

        {user && (
          <div className="px-6 py-4 border-b border-white/10">
            <p className="text-white font-medium">{user.fullName}</p>
            <p className="text-gray-400 text-sm">{user.email || user.phone}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded-full">
              {user.bloodType} 🩸
            </span>
          </div>
        )}

        <nav className="py-4">
          <ul>
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                    pathname === item.href ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-3 text-gray-400 hover:text-white w-full"
          >
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}