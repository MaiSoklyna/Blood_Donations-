'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';

interface UserData {
  email: string;
  full_name?: string;
  blood_type?: string;
  gender?: string;
}

export default function DashboardPage() {
  const [pageReady, setPageReady] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('app_token');
    const userDataStr = localStorage.getItem('user_data');
    
    console.log('🔍 Dashboard - token:', !!token, 'userData:', !!userDataStr);
    
    if (!token || !userDataStr) {
      window.location.replace('/login');
      return;
    }
    
    try {
      const userData = JSON.parse(userDataStr);
      setUser(userData);
      setPageReady(true);
    } catch {
      window.location.replace('/login');
    }
  }, []);

  if (!pageReady || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const firstName = user.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Donor';

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64">
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 md:p-8 text-white mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome back, {firstName}!
          </h1>
          <p className="text-red-100 mb-4">
            Thank you for being a hero. Your donations save lives.
          </p>
          <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold bg-blue-500">
            New Donor
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <p className="text-3xl md:text-4xl font-bold text-red-600">0</p>
            <p className="text-gray-500 text-sm">Total Donations</p>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <p className="text-2xl md:text-3xl font-bold text-red-600">N/A</p>
            <p className="text-gray-500 text-sm">Last Donation</p>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <p className="text-2xl md:text-3xl font-bold text-green-600">Now!</p>
            <p className="text-gray-500 text-sm">Next Eligible</p>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
            <p className="text-3xl md:text-4xl font-bold text-red-600">0</p>
            <p className="text-gray-500 text-sm">Lives Saved</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Profile</h2>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{user.full_name || 'Not set'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-sm">{user.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Blood Type</span>
                <span className="font-medium text-red-600 text-lg">{user.blood_type || 'Not set'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Gender</span>
                <span className="font-medium capitalize">{user.gender || 'Not set'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/hospitals" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                <span className="text-2xl block mb-2">🏥</span>
                <span className="text-sm font-medium">Find Hospital</span>
              </Link>
              <Link href="/events" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                <span className="text-2xl block mb-2">📅</span>
                <span className="text-sm font-medium">Events</span>
              </Link>
              <Link href="/blood-market" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                <span className="text-2xl block mb-2">🩸</span>
                <span className="text-sm font-medium">Blood Market</span>
              </Link>
              <Link href="/tips" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                <span className="text-2xl block mb-2">💡</span>
                <span className="text-sm font-medium">Tips</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}