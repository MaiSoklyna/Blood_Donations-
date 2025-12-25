'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store';
import { benefitsApi } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import LoadingSpinner from '@/components/ui/Loading';

export default function DonationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Wait for client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not authenticated (only after mounting)
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  // Fetch benefits data
  const { data: benefitsData, isLoading } = useQuery({
    queryKey: ['benefits'],
    queryFn: async () => {
      try {
        const response = await benefitsApi.getMyBenefits();
        console.log('✅ Benefits data:', response);
        return response;
      } catch (error) {
        console.warn('Benefits API error:', error);
        return null;
      }
    },
    enabled: mounted && isAuthenticated,
  });

  // Show loading while checking auth
  if (!mounted || (!isAuthenticated && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Calculate stats from benefits data
  const stats = {
    totalDonations: benefitsData?.total_donations || 0,
    totalVolume: `${((benefitsData?.total_donations || 0) * 0.45).toFixed(1)}L`,
    livesSaved: (benefitsData?.total_donations || 0) * 3,
    level: benefitsData?.level || 'new',
  };

  // Get level display info
  const getLevelInfo = (level: string) => {
    switch (level) {
      case 'gold': return { text: 'Gold', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-300' };
      case 'silver': return { text: 'Silver', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-300' };
      case 'bronze': return { text: 'Bronze', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-300' };
      default: return { text: 'New', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-300' };
    }
  };

  const levelInfo = getLevelInfo(stats.level);

  // Format date helper
  const formatDate = (dateString: string | null | undefined) => {
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Donation History</h1>
          <p className="text-gray-500 mt-1">Track your blood donation journey and impact</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
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

            {/* Donation Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Donation Timeline</h2>
              
              {stats.totalDonations > 0 ? (
                <div className="space-y-4">
                  {/* Show last donation */}
                  {benefitsData?.last_donation_date && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-red-600 text-xl">🩸</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Blood Donation</p>
                        <p className="text-sm text-gray-500">{formatDate(benefitsData.last_donation_date)}</p>
                        <p className="text-sm text-green-600 mt-1">Successfully completed</p>
                      </div>
                      <span className="text-sm text-gray-400">Latest</span>
                    </div>
                  )}
                  
                  {/* Placeholder for more donations */}
                  {stats.totalDonations > 1 && (
                    <p className="text-center text-gray-500 py-4">
                      + {stats.totalDonations - 1} more donation{stats.totalDonations > 2 ? 's' : ''}
                    </p>
                  )}
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🩸</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No donations yet.</h3>
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

            {/* Donor Level Progress */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Donor Level Progress</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Bronze */}
                <div className={`text-center p-4 rounded-lg border-2 ${
                  stats.level === 'bronze' || stats.level === 'silver' || stats.level === 'gold'
                    ? 'bg-amber-50 border-amber-400'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    stats.level === 'bronze' || stats.level === 'silver' || stats.level === 'gold'
                      ? 'bg-amber-600'
                      : 'bg-gray-300'
                  }`}>
                    <span className="text-white text-xl">🥉</span>
                  </div>
                  <p className="font-semibold text-amber-700">Bronze</p>
                  <p className="text-sm text-gray-500">1+ donations</p>
                </div>
                
                {/* Silver */}
                <div className={`text-center p-4 rounded-lg border-2 ${
                  stats.level === 'silver' || stats.level === 'gold'
                    ? 'bg-gray-100 border-gray-400'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    stats.level === 'silver' || stats.level === 'gold'
                      ? 'bg-gray-500'
                      : 'bg-gray-300'
                  }`}>
                    <span className="text-white text-xl">🥈</span>
                  </div>
                  <p className="font-semibold text-gray-600">Silver</p>
                  <p className="text-sm text-gray-500">3+ donations</p>
                </div>
                
                {/* Gold */}
                <div className={`text-center p-4 rounded-lg border-2 ${
                  stats.level === 'gold'
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    stats.level === 'gold'
                      ? 'bg-yellow-500'
                      : 'bg-gray-300'
                  }`}>
                    <span className="text-white text-xl">🥇</span>
                  </div>
                  <p className="font-semibold text-yellow-600">Gold</p>
                  <p className="text-sm text-gray-500">5+ donations</p>
                </div>
                
                {/* Platinum */}
                <div className="text-center p-4 rounded-lg bg-gray-50 border-2 border-gray-200">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-xl">💎</span>
                  </div>
                  <p className="font-semibold text-purple-600">Platinum</p>
                  <p className="text-sm text-gray-500">10+ donations</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Progress to next level</span>
                  <span>{stats.totalDonations} / {
                    stats.level === 'new' ? 1 :
                    stats.level === 'bronze' ? 3 :
                    stats.level === 'silver' ? 5 : 10
                  } donations</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-600 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, (stats.totalDonations / (
                        stats.level === 'new' ? 1 :
                        stats.level === 'bronze' ? 3 :
                        stats.level === 'silver' ? 5 : 10
                      )) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}