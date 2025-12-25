
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { hospitalsApi } from '@/lib/api';

interface BloodInventory {
  'A+': number;
  'A-': number;
  'B+': number;
  'B-': number;
  'O+': number;
  'O-': number;
  'AB+': number;
  'AB-': number;
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  description?: string;
  image_url?: string;
  blood_inventory?: Partial<BloodInventory> | null; // made optional to be safe
  is_active: boolean;
}

type StockLevel = { color: string; label: 'High' | 'Medium' | 'Low' };

function getStockLevel(count: number): StockLevel {
  if (Number.isNaN(count)) return { color: 'bg-gray-300', label: 'Low' };
  if (count >= 15) return { color: 'bg-green-500', label: 'High' };
  if (count >= 5) return { color: 'bg-yellow-500', label: 'Medium' };
  return { color: 'bg-red-500', label: 'Low' };
}

const BLOOD_TYPES: (keyof BloodInventory)[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'O+',
  'O-',
  'AB+',
  'AB-',
];

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input to avoid filtering on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    let isMounted = true;

    const fetchHospitals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await hospitalsApi.getAll();
        // Expecting response.data to be Hospital[]
        setHospitals(Array.isArray(response?.data) ? response.data : []);
        // eslint-disable-next-line no-console
        console.log('✅ Hospitals loaded:', response);
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch hospitals:', err);
        if (isMounted) {
          setError('Unable to load hospitals right now. Please try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHospitals();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredHospitals = useMemo(() => {
    if (!debouncedSearch) return hospitals;
    const q = debouncedSearch.toLowerCase();
    return hospitals.filter((h) => {
      const name = h.name?.toLowerCase() ?? '';
      const addr = h.address?.toLowerCase() ?? '';
      return name.includes(q) || addr.includes(q);
    });
  }, [hospitals, debouncedSearch]);

  return (
    <div className="min-h-screen bg-gray-50">
      

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Find a Hospital</h1>
          <p className="text-red-100 mb-6">
            Locate blood donation centers near you and check blood availability
          </p>

          <label htmlFor="hospital-search" className="sr-only">
            Search hospitals by name or location
          </label>
          <input
            id="hospital-search"
            type="text"
            placeholder="Search hospitals by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label="Search hospitals"
          />
        </div>
      </div>

      {/* Hospitals List */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => location.reload()}
              className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No hospitals found</p>
            {searchTerm && (
              <p className="text-gray-500 text-sm mt-2">
                Try adjusting your search term or clearing the filter.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredHospitals.map((hospital) => {
              const inventory = hospital.blood_inventory ?? {};
              return (
                <div
                  key={hospital.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Optional image banner */}
                  {hospital.image_url && (
                    <div className="h-40 bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={hospital.image_url}
                        alt={`${hospital.name} photo`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{hospital.name}</h2>
                        <p className="text-gray-500 text-sm mt-1">{hospital.address}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          hospital.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                        aria-label={`Status: ${hospital.is_active ? 'Open' : 'Closed'}`}
                      >
                        {hospital.is_active ? 'Open' : 'Closed'}
                      </span>
                    </div>

                    {hospital.description && (
                      <p className="text-gray-600 text-sm mb-4">{hospital.description}</p>
                    )}

                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      {hospital.phone ? (
                        <a
                          href={`tel:${encodeURIComponent(hospital.phone)}`}
                          className="flex items-center gap-1 hover:text-red-600"
                          aria-label={`Call ${hospital.name}`}
                        >
                          📞 {hospital.phone}
                        </a>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400">📞 N/A</span>
                      )}

                      {hospital.email ? (
                        <a
                          href={`mailto:${encodeURIComponent(hospital.email)}`}
                          className="flex items-center gap-1 hover:text-red-600"
                          aria-label={`Email ${hospital.name}`}
                        >
                          ✉️ {hospital.email}
                        </a>
                      ) : null}
                    </div>

                    {/* Blood Inventory */}
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Blood Inventory</h3>

                      {/* If no inventory available */}
                      {!inventory || Object.keys(inventory).length === 0 ? (
                        <p className="text-gray-500 text-sm">Inventory data not available.</p>
                      ) : (
                        <div className="grid grid-cols-4 gap-2">
                          {BLOOD_TYPES.map((type) => {
                            const count = Number(inventory[type] ?? 0);
                            const stock = getStockLevel(count);
                            return (
                              <div key={type} className="text-center p-2 bg-gray-50 rounded-lg">
                                <span className="block font-bold text-red-600">{type}</span>
                                <span className="text-xs text-gray-500">{count} units</span>
                                <span
                                  className={`block w-full h-1 mt-1 rounded ${stock.color}`}
                                  aria-label={`Stock ${stock.label}`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-gray-50 flex justify-between items-center">
                    <Link
                      href={`/hospitals/${hospital.id}`}
                      className="text-red-600 hover:underline text-sm font-medium"
                      aria-label={`View details for ${hospital.name}`}
                    >
                      View Details →
                    </Link>

                    {/* ✅ Fixed the missing opening <a> tag */}
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(hospital.address ?? hospital.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                      aria-label={`Get directions to ${hospital.name}`}
                    >
                      📍 Get Directions
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/** Simple shimmer loading state */
function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="h-40 bg-gray-200 animate-pulse" />
          <div className="p-6 space-y-3">
            <div className="h-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="border-t pt-4">
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[...Array(4)].map((__, j) => (
                  <div key={j} className="p-2 bg-gray-100 rounded">
                    <div className="h-3 bg-gray-200 rounded animate-pulse" />
                    <div className="h-2 bg-gray-200 rounded mt-2 animate-pulse" />
                    <div className="h-1 bg-gray-200 rounded mt-1 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="px-6 py-3 bg-gray-50 flex justify-between items-center">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

