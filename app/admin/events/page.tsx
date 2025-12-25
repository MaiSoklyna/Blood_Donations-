'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { eventsApi } from '@/lib/api';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  hospital_id: string;
  image_url?: string;
  max_participants: number;
  registered_count: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  hospitals?: { name: string };
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getAll();
        console.log('✅ Events loaded:', response);
        setEvents(response.data || []);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => 
    filter === 'all' || event.status === filter
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'ongoing': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRegister = async (eventId: string) => {
    const token = localStorage.getItem('app_token');
    if (!token) {
      alert('Please login to register for events');
      window.location.href = '/login';
      return;
    }

    try {
      await eventsApi.register(eventId);
      alert('Successfully registered for the event!');
      // Refresh events
      const response = await eventsApi.getAll();
      setEvents(response.data || []);
    } catch (error) {
      console.error('Failed to register:', error);
      alert('Failed to register. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Blood Donation Events</h1>
          <p className="text-red-100 mb-6">
            Join our upcoming blood donation drives and help save lives
          </p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'upcoming', 'ongoing', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-white text-red-600'
                    : 'bg-red-500 text-white hover:bg-red-400'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Event Image */}
                <div className="h-48 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                  <span className="text-6xl">🩸</span>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-lg font-bold text-gray-900 line-clamp-2">{event.title}</h2>
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ml-2 ${getStatusStyle(event.status)}`}>
                      {event.status}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{event.location}</span>
                    </div>
                    {event.hospitals?.name && (
                      <div className="flex items-center gap-2">
                        <span>🏥</span>
                        <span>{event.hospitals.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Registration Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Registered</span>
                      <span>{event.registered_count} / {event.max_participants}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${Math.min((event.registered_count / event.max_participants) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {event.status === 'upcoming' && event.registered_count < event.max_participants ? (
                    <button
                      onClick={() => handleRegister(event.id)}
                      className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                    >
                      Register Now
                    </button>
                  ) : event.status === 'upcoming' ? (
                    <button
                      disabled
                      className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                    >
                      Fully Booked
                    </button>
                  ) : (
                    <Link
                      href={`/events/${event.id}`}
                      className="block w-full py-3 text-center border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}