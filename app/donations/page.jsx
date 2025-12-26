'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from './../../components/layout/Sidebar';
import { benefitsApi } from './../../lib/api';

export default function DonationsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [benefitsData, setBenefitsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const token = localStorage.getItem('app_token');
    const userStr = localStorage.getItem('user_data');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }
    
    try {
      setUser(JSON.parse(userStr));
    } catch {
      router.push('/login');
      return;
    }

    // Fetch benefits
    const fetchBenefits = async () => {
      try {
        const response = await benefitsApi.getMyBenefits();
        console.log('✅ Benefits data:', response);
        setBenefitsData(response);
      } catch (error) {
        console.warn('Benefits API error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBenefits();
  }, [router]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = {
    totalDonations: benefitsData?.total_donations || 0,
    totalVolume: `${((benefitsData?.total_donations || 0) * 0.45).toFixed(1)}L`,
    livesSaved: (benefitsData?.total_donations || 0) * 3,
    level: benefitsData?.level || 'new',
  };

  const getLevelInfo = (level) => {
    switch (level) {
      case 'gold': return { text: 'Gold', color: 'text-yellow-500' };
      case 'silver': return { text: 'Silver', color: 'text-gray-500' };
      case 'bronze': return { text: 'Bronze', color: 'text-amber-600' };
      default: return { text: 'New', color: 'text-blue-600' };
    }
  };

  const levelInfo = getLevelInfo(stats.level);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Donation History</h1>
          <p className="text-gray-500 mt-1">Track your blood donation journey and impact</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
              <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
                <p className="text-3xl md:text-4xl font-bold text-red-600">{stats.totalDonations}</p>
                <p className="text-gray-500 text-sm">Total Donations</p>
              </div>
              <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
                <p className="text-3xl md:text-4xl font-bold text-red-600">{stats.totalVolume}</p>
                <p className="text-gray-500 text-sm">Total Volume</p>
              </div>
              <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
                <p className="text-3xl md:text-4xl font-bold text-red-600">{stats.livesSaved}</p>
                <p className="text-gray-500 text-sm">Lives Saved</p>
              </div>
              <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
                <p className={`text-3xl md:text-4xl font-bold ${levelInfo.color}`}>{levelInfo.text}</p>
                <p className="text-gray-500 text-sm">Donor Level</p>
              </div>
            </div>

            {/* Eligibility Status */}
            {benefitsData && (
              <div className={`rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-3 ${
                benefitsData.eligible 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-orange-50 border border-orange-200'
              }`}>
                <span className="text-2xl">{benefitsData.eligible ? '✅' : '⏳'}</span>
                <div className="flex-1">
                  <p className={`font-semibold ${benefitsData.eligible ? 'text-green-800' : 'text-orange-800'}`}>
                    {benefitsData.eligible 
                      ? "You're eligible to donate!" 
                      : "You're not eligible yet"}
                  </p>
                  <p className={`text-sm ${benefitsData.eligible ? 'text-green-600' : 'text-orange-600'}`}>
                    {benefitsData.eligible 
                      ? 'Find a nearby hospital and schedule your donation today.'
                      : `Next eligible date: ${formatDate(benefitsData.next_eligible_date) || 'N/A'}`}
                  </p>
                </div>
                {benefitsData.eligible && (
                  <Link href="/hospitals" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                    Donate Now
                  </Link>
                )}
              </div>
            )}

            {/* Empty State or Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Donation Timeline</h2>
              
              {stats.totalDonations > 0 && benefitsData?.last_donation_date ? (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-xl">🩸</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Blood Donation</p>
                    <p className="text-sm text-gray-500">{formatDate(benefitsData.last_donation_date)}</p>
                    <p className="text-sm text-green-600 mt-1">Successfully completed</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🩸</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No donations yet</h3>
                  <p className="text-gray-500 mb-6">Start your journey by donating blood today!</p>
                  <Link 
                    href="/hospitals" 
                    className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Find a Donation Center
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}