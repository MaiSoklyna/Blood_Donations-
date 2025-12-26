
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { hospitalsApi } from './../../lib/api';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

function getStockLevel(count) {
  if (isNaN(count)) return { color: 'bg-gray-300', label: 'Low' };
  if (count >= 15) return { color: 'bg-green-500', label: 'High' };
  if (count >= 5) return { color: 'bg-yellow-500', label: 'Medium' };
  return { color: 'bg-red-500', label: 'Low' };
}

export default function HospitalsClient() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce the search term
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch hospitals
  useEffect(() => {
    let isMounted = true;

    const fetchHospitals = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await hospitalsApi.getAll();

        if (isMounted) {
          setHospitals(Array.isArray(response?.data) ? response.data : []);
        }

        console.log('✅ Hospitals loaded:', response);
      } catch (err) {
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

  // Filter hospitals by search
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
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Find a Hospital</h1>
              <p className="text-red-100">
                Locate blood donation centers near you and check blood availability
              </p>
            </div>
            <div className="w-full md:w-auto">
              <input
                type="text"
                placeholder="Search by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Hospitals List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm p-6 animate-pulse h-48"
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={() => location.reload()}
              className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hospitals found</h3>
            <p className="text-gray-500">Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital) => {
              const inventory = hospital.blood_inventory ?? {};

              return (
                <div
                  key={hospital.id ?? hospital.name}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6 space-y-3">
                    <h3 className="text-lg font-bold text-gray-900">{hospital.name}</h3>

                    {hospital.address && (
                      <p className="text-sm text-gray-600">{hospital.address}</p>
                    )}

                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        hospital.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {hospital.is_active ? 'Open' : 'Closed'}
                    </span>

                    {hospital.description && (
                      <p className="text-gray-700 text-sm">{hospital.description}</p>
                    )}

                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-3 pt-2">
                      {hospital.phone && (
                        <a
                          href={`tel:${hospital.phone}`}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                        >
                          📞 {hospital.phone}
                        </a>
                      )}
                      {hospital.email && (
                        <a
                          href={`mailto:${hospital.email}`}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                        >
                          ✉️ {hospital.email}
                        </a>
                      )}
                    </div>

                    {/* Blood Inventory */}
                    <div className="pt-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Blood Inventory
                      </h4>

                      {!inventory || Object.keys(inventory).length === 0 ? (
                        <p className="text-gray-500 text-sm">Inventory data not available.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {BLOOD_TYPES.map((type) => {
                            const count = Number(inventory[type] ?? 0);
                            const stock = getStockLevel(count);

                            return (
                              <div
                                key={type}
                                className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border"
                              >
                                <span className="font-medium text-gray-900">{type}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-700">{count} units</span>
                                  <span className={`w-3 h-3 inline-block rounded-full ${stock.color}`} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <Link
                        href={`/hospitals/${hospital.id ?? ''}`}
                        className="text-red-600 hover:underline text-sm"
                      >
                        View Details →
                      </Link>

                      {hospital.address || hospital.name ? (
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(
                            hospital.address ?? hospital.name
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          📍 Get Directions
                        </a>
                      ) : null}
                    </div>
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
