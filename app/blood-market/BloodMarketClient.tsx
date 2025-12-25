'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { bloodMarketApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { timeAgo, getUrgencyClass } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/Loading';

interface BloodMarketListing {
  id: string;
  user_id: string;
  type: 'request' | 'offer';
  blood_type: string;
  quantity_ml: number;
  urgency: 'critical' | 'urgent' | 'normal' | 'high' | 'low';
  location: string;
  contact_phone?: string;
  description: string;
  status: 'open' | 'fulfilled' | 'expired';
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

type FilterType = 'all' | 'request' | 'offer';

export default function BloodMarketClient() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Fetch blood market listings from API
  const { data: listings, isLoading } = useQuery({
    queryKey: ['blood-market'],
    queryFn: async () => {
      const response = await bloodMarketApi.getAll();
      return response.data || response || [];
    },
  });

  // Handle contact - require login
  const handleContact = (listing: BloodMarketListing) => {
    if (!isAuthenticated) {
      // Redirect to login
      router.push('/login');
      return;
    }
    
    // Show contact info if logged in
    if (listing.contact_phone) {
      alert(`📞 Contact: ${listing.contact_phone}\n📍 Location: ${listing.location}`);
    } else {
      alert(`📍 Location: ${listing.location}\n\nContact the hospital or blood bank for more information.`);
    }
  };

  // Handle create listing - require login
  const handleCreateListing = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    alert('Create listing feature coming soon!');
  };

  // Ensure listings is an array and filter
  const listingArray: BloodMarketListing[] = Array.isArray(listings) ? listings : [];
  const filteredListings = listingArray.filter((listing) => {
    if (activeFilter === 'all') return true;
    return listing.type === activeFilter;
  });

  if (isLoading) {
    return (
      <>
        <div className="page-header">
          <div className="container">
            <h1 className="page-title">Blood Market</h1>
            <p className="page-subtitle">Request or offer blood donations to help those in need</p>
          </div>
        </div>
        <section className="py-16">
          <div className="container flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Blood Market</h1>
          <p className="page-subtitle">Request or offer blood donations to help those in need</p>
        </div>
      </div>

      <section className="py-8 bg-white">
        <div className="container">
          {/* Login prompt if not authenticated */}
          {!isAuthenticated && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-amber-800 font-medium">🔐 Login required</p>
                <p className="text-amber-600 text-sm">Login to contact donors or create listings</p>
              </div>
              <button 
                onClick={() => router.push('/login')}
                className="btn-primary"
              >
                Login
              </button>
            </div>
          )}

          {/* Create Button */}
          <button className="btn-primary mb-6" onClick={handleCreateListing}>
            + Create New Listing
          </button>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              className={`tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Listings
            </button>
            <button
              className={`tab ${activeFilter === 'request' ? 'active' : ''}`}
              onClick={() => setActiveFilter('request')}
            >
              🆘 Requests
            </button>
            <button
              className={`tab ${activeFilter === 'offer' ? 'active' : ''}`}
              onClick={() => setActiveFilter('offer')}
            >
              🎁 Offers
            </button>
          </div>
        </div>
      </section>

      <section className="py-8 bg-gray-50">
        <div className="container">
          {filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🩸</span>
              <p className="text-gray-500 text-lg">No listings found.</p>
              <p className="text-gray-400">Be the first to create a blood request or offer!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="card">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        listing.type === 'request' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {listing.type === 'request' ? '🆘 REQUEST' : '🎁 OFFER'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getUrgencyClass(listing.urgency as 'critical' | 'urgent' | 'normal')}`}>
                      {listing.urgency?.toUpperCase() || 'NORMAL'}
                    </span>
                  </div>

                  {/* Blood Type */}
                  <div className="text-5xl font-bold text-red-600 my-4">
                    {listing.blood_type}
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-gray-500 text-sm">
                    <p>📍 {listing.location}</p>
                    <p>📅 Posted {timeAgo(listing.created_at)}</p>
                  </div>

                  {/* Description */}
                  {listing.description && (
                    <p className="text-gray-600 my-4 line-clamp-2">{listing.description}</p>
                  )}

                  {/* Quantity */}
                  <p className="text-gray-500 text-sm mb-4">
                    <strong>Quantity:</strong> {listing.quantity_ml >= 900 ? '2 units' : '1 unit'} ({listing.quantity_ml}ml)
                  </p>

                  {/* Contact Button */}
                  <button 
                    className="btn-primary w-full" 
                    onClick={() => handleContact(listing)}
                  >
                    {isAuthenticated 
                      ? (listing.type === 'request' ? 'Contact Now' : 'Contact Donor')
                      : '🔐 Login to Contact'
                    }
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}