'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/ui/Loading';

export default function ItemsClient() {
  const [endpoint, setEndpoint] = useState('/items');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['items', endpoint],
    queryFn: async () => {
      const response = await api.getItems(endpoint);
      return response.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">API Items</h1>
          <p className="page-subtitle">Fetch and display items from the API</p>
        </div>
      </div>

      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Endpoint Configuration</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                className="input-field flex-1"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="/items"
              />
              <button 
                className="btn-primary"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                {isLoading ? 'Fetching...' : 'Fetch Items'}
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              Base URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'https://borejak-backend.vercel.app'}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Response</h2>
              {data && Array.isArray(data) && (
                <span className="text-gray-500 text-sm">{data.length} item(s)</span>
              )}
            </div>

            {isLoading && (
              <div className="py-12 text-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <p className="text-gray-500">Fetching items...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">❌</span>
                  <h3 className="font-semibold text-red-800">Error Fetching Items</h3>
                </div>
                <p className="text-red-600 text-sm">
                  {error instanceof Error ? error.message : 'Unknown error occurred'}
                </p>
              </div>
            )}

            {!isLoading && !error && data && (
              <div className="space-y-4">
                {Array.isArray(data) && data.length > 0 ? (
                  <div className="grid gap-4">
                    {data.map((item: Record<string, unknown>, index: number) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
                          {JSON.stringify(item, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : Array.isArray(data) && data.length === 0 ? (
                  <div className="py-12 text-center">
                    <span className="text-4xl mb-4 block">📭</span>
                    <p className="text-gray-500">No items found. The endpoint returned an empty array.</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Raw Response</h3>
                    <pre className="p-4 bg-gray-100 rounded-lg overflow-x-auto text-sm">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {!isLoading && !error && !data && (
              <div className="py-12 text-center">
                <span className="text-4xl mb-4 block">📭</span>
                <p className="text-gray-500">No data returned from the API.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}