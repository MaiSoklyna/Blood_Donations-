'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './../../components/layout/Header';

export default function BenefitsPage() {
  const router = useRouter();
  const [benefits, setBenefits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

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

    fetchBenefits();
  }, [router]);

  const fetchBenefits = async () => {
    try {
      const token = localStorage.getItem('app_token');
      const response = await fetch(`${API_URL}/api/benefits/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setBenefits(result.data || result);
      } else {
        // Default benefits if API fails
        setBenefits({
          total_donations: 0,
          level: 'bronze',
          eligible: true,
          next_eligible_date: null,
        });
      }
    } catch (err) {
      console.error('Fetch benefits error:', err);
      setBenefits({
        total_donations: 0,
        level: 'bronze',
        eligible: true,
        next_eligible_date: null,
      });
    }
    setLoading(false);
  };

  const getLevelInfo = (level) => {
    const levels = {
      bronze: { color: 'bg-amber-600', icon: '🥉', min: 0, max: 4, perks: ['Certificate', 'Thank you card'] },
      silver: { color: 'bg-gray-400', icon: '🥈', min: 5, max: 9, perks: ['Certificate', 'Priority booking', 'Health checkup'] },
      gold: { color: 'bg-yellow-500', icon: '🥇', min: 10, max: 24, perks: ['Certificate', 'Priority booking', 'Health checkup', 'Special events'] },
      platinum: { color: 'bg-purple-500', icon: '💎', min: 25, max: null, perks: ['All Gold perks', 'VIP treatment', 'Annual recognition'] },
    };
    return levels[level] || levels.bronze;
  };

  const levelInfo = benefits ? getLevelInfo(benefits.level) : getLevelInfo('bronze');

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">My Benefits</h1>
            <p className="text-gray-500">Track your donations and unlock rewards</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Level Card */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className={`${levelInfo.color} text-white p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Current Level</p>
                      <h2 className="text-3xl font-bold capitalize flex items-center gap-2">
                        {levelInfo.icon} {benefits?.level || 'Bronze'}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold">{benefits?.total_donations || 0}</p>
                      <p className="text-sm opacity-80">Total Donations</p>
                    </div>
                  </div>

                  {/* Progress to next level */}
                  {benefits?.level !== 'platinum' && (
                    <div className="mt-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress to next level</span>
                        <span>{benefits?.total_donations || 0} / {levelInfo.max + 1}</span>
                      </div>
                      <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full transition-all"
                          style={{ width: `${Math.min(((benefits?.total_donations || 0) / (levelInfo.max + 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Perks */}
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Your Perks</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {levelInfo.perks.map((perk, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-700">
                        <span className="text-green-500">✓</span>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Eligibility Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Donation Eligibility</h3>
                {benefits?.eligible ? (
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                    <span className="text-4xl">✅</span>
                    <div>
                      <p className="font-medium text-green-700">You are eligible to donate!</p>
                      <p className="text-sm text-green-600">Find an event or hospital to donate blood</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                    <span className="text-4xl">⏳</span>
                    <div>
                      <p className="font-medium text-yellow-700">Not yet eligible</p>
                      <p className="text-sm text-yellow-600">
                        You can donate again on {benefits?.next_eligible_date ? new Date(benefits.next_eligible_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Level Guide */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Level Guide</h3>
                <div className="space-y-4">
                  {['bronze', 'silver', 'gold', 'platinum'].map((level) => {
                    const info = getLevelInfo(level);
                    const isCurrentLevel = benefits?.level === level;
                    return (
                      <div 
                        key={level} 
                        className={`flex items-center gap-4 p-4 rounded-lg ${isCurrentLevel ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}`}
                      >
                        <span className="text-2xl">{info.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium capitalize">{level}</p>
                          <p className="text-sm text-gray-500">
                            {info.min} - {info.max || '∞'} donations
                          </p>
                        </div>
                        {isCurrentLevel && (
                          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">Current</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}