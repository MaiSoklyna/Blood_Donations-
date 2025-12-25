'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hospitalsApi } from '@/lib/api';
import LoadingSpinner from '@/components/ui/Loading';

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
  image_url?: string;
  blood_inventory?: Record<string, number>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function HospitalsClient() {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch hospitals from API
  const { data: hospitals, isLoading, error } = useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const response = await hospitalsApi.getAll();
      return response.data || response || [];
    },
  });

  const handleDonate = (hospitalName: string) => {
    alert(`Redirecting to donation scheduling for ${hospitalName}...`);
  };

  // Filter hospitals based on search
  const hospitalList: Hospital[] = Array.isArray(hospitals) ? hospitals : [];
  const filteredHospitals = hospitalList.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <>
        <div className="page-header">
          <div className="container">
            <h1 className="page-title">Partner Hospitals</h1>
            <p className="page-subtitle">Find blood donation centers and check blood availability</p>
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
          <h1 className="page-title">Partner Hospitals</h1>
          <p className="page-subtitle">Find blood donation centers and check blood availability</p>
        </div>
      </div>

      {/* Search */}
      <section className="py-8 bg-white">
        <div className="container">
          <div className="max-w-xl mx-auto flex gap-4">
            <input
              type="text"
              className="input-field flex-1"
              placeholder="Search hospitals by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn-primary">Search</button>
          </div>
        </div>
      </section>

      {/* Hospitals Grid */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          {filteredHospitals.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🏥</span>
              <p className="text-gray-500 text-lg">
                {searchQuery ? 'No hospitals found matching your search.' : 'No hospitals available.'}
              </p>
              {searchQuery && (
                <button
                  className="btn-secondary mt-4"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredHospitals.map((hospital) => (
                <div key={hospital.id} className="card">
                  {/* Hospital Icon */}
                  <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-red-500 rounded-xl flex items-center justify-center text-4xl mb-4">
                    {hospital.image_url ? (
                      <img 
                        src={hospital.image_url} 
                        alt={hospital.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      '🏥'
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">{hospital.name}</h3>
                  
                  <div className="space-y-2 text-gray-500 text-sm">
                    <p>📍 {hospital.address}</p>
                    <p>📞 {hospital.phone}</p>
                    <p>✉️ {hospital.email}</p>
                  </div>

                  {hospital.description && (
                    <p className="text-gray-600 mt-3 text-sm">{hospital.description}</p>
                  )}

                  {/* Blood Inventory */}
                  {hospital.blood_inventory && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm text-gray-500 mb-3">Blood Inventory Available</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {bloodTypes.map((type) => (
                          <div key={type} className="text-center p-2 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500">{type}</div>
                            <div className={`text-lg font-bold ${
                              (hospital.blood_inventory?.[type] || 0) < 5 
                                ? 'text-red-600' 
                                : 'text-green-600'
                            }`}>
                              {hospital.blood_inventory?.[type] || 0}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    className="btn-primary w-full mt-4"
                    onClick={() => handleDonate(hospital.name)}
                  >
                    Donate Here
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