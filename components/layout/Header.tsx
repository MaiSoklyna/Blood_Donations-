'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore, checkAuthFromStorage } from '@/lib/store';

export default function Header() {
  const { user, logout, loadFromStorage } = useAuthStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loggedIn = checkAuthFromStorage();
    if (loggedIn) {
      loadFromStorage();
      setIsLoggedIn(true);
    }
  }, [loadFromStorage]);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🩸</span>
            <span className="font-bold text-xl text-gray-900">BloodConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/hospitals" className="text-gray-600 hover:text-red-600 transition-colors">
              Hospitals
            </Link>
            <Link href="/events" className="text-gray-600 hover:text-red-600 transition-colors">
              Events
            </Link>
            <Link href="/blood-market" className="text-gray-600 hover:text-red-600 transition-colors">
              Blood Market
            </Link>
            <Link href="/tips" className="text-gray-600 hover:text-red-600 transition-colors">
              Tips
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {mounted && isLoggedIn ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
                <Link 
                  href="/dashboard" 
                  className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-semibold"
                >
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-red-600 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/login" 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              <Link href="/hospitals" className="text-gray-600 hover:text-red-600">Hospitals</Link>
              <Link href="/events" className="text-gray-600 hover:text-red-600">Events</Link>
              <Link href="/blood-market" className="text-gray-600 hover:text-red-600">Blood Market</Link>
              <Link href="/tips" className="text-gray-600 hover:text-red-600">Tips</Link>
              
              <hr className="my-2" />
              
              {mounted && isLoggedIn ? (
                <>
                  <Link href="/dashboard" className="text-gray-600 hover:text-red-600">Dashboard</Link>
                  <button onClick={handleLogout} className="text-left text-gray-600 hover:text-red-600">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-red-600">Login</Link>
                  <Link href="/login" className="text-red-600 font-medium">Register</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}