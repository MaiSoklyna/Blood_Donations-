'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tipsApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/Loading';

interface Tip {
  id: string;
  title: string;
  content: string;
  category: 'before' | 'during' | 'after' | 'general';
  image_url?: string;
  order?: number;
  is_published?: boolean;
  created_at: string;
  updated_at: string;
}

type FilterType = 'all' | 'before' | 'during' | 'after' | 'general';

const categoryLabels: Record<FilterType, string> = {
  all: 'All Tips',
  before: 'Before Donation',
  during: 'During Donation',
  after: 'After Donation',
  general: 'General',
};

const categoryIcons: Record<string, string> = {
  before: '🥗',
  during: '🧘',
  after: '🍪',
  general: '📋',
};

export default function TipsClient() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Fetch tips from API
  const { data: tips, isLoading, error } = useQuery({
    queryKey: ['tips'],
    queryFn: async () => {
      const response = await tipsApi.getAll();
      return response.data || response || [];
    },
  });

  // Ensure tips is an array and filter
  const tipArray: Tip[] = Array.isArray(tips) ? tips : [];
  const filteredTips = tipArray.filter((tip) => {
    if (activeFilter === 'all') return true;
    return tip.category === activeFilter;
  });

  if (isLoading) {
    return (
      <>
        <div className="page-header">
          <div className="container">
            <h1 className="page-title">Blood Donation Tips</h1>
            <p className="page-subtitle">Everything you need to know about donating blood safely</p>
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
          <h1 className="page-title">Blood Donation Tips</h1>
          <p className="page-subtitle">Everything you need to know about donating blood safely</p>
        </div>
      </div>

      <section className="py-8 bg-white">
        <div className="container">
          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {(Object.keys(categoryLabels) as FilterType[]).map((filter) => (
              <button
                key={filter}
                className={`tab ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {categoryLabels[filter]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 bg-gray-50">
        <div className="container">
          {filteredTips.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">💡</span>
              <p className="text-gray-500 text-lg">No tips found for this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTips.map((tip) => (
                <div key={tip.id} className="card">
                  {/* Icon */}
                  <div className="text-5xl mb-4">
                    {categoryIcons[tip.category] || '💡'}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{tip.title}</h3>

                  {/* Content */}
                  <p className="text-gray-600 mb-4">{tip.content}</p>

                  {/* Category Badge */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500 uppercase font-medium">
                      {categoryLabels[tip.category as FilterType] || tip.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}