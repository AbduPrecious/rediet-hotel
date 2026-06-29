'use client';

import { useState } from 'react';
import Link from 'next/link';
import NavbarWrapper from '@/app/components/NavbarWrapper';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default function BookingStatusPage() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await fetch(
        `${STRAPI_URL}/api/bookings?filters[email][$eq]=${encodeURIComponent(email)}&populate[paymentScreenshot]=*&populate[room][fields][0]=title`
      );
      const data = await res.json();
      
      if (data.data && data.data.length > 0) {
        setBookings(data.data);
      } else {
        setBookings([]);
        setError('No bookings found for this email');
      }
    } catch (err) {
      setError('Failed to fetch bookings. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      case 'pending':
      default:
        return '⏳';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <NavbarWrapper hotelName="Rediet Hotel - Shashamane" />

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Booking Status</h1>
          <p className="text-xl text-white/90">Check the status of your bookings</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-white dark:bg-gray-900/50"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-[1.02] disabled:opacity-70"
            >
              {loading ? 'Searching...' : 'Check Status'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl">
              {error}
            </div>
          )}
        </div>

        {/* Bookings List */}
        {searched && (
          <div className="mt-8 space-y-6">
            {bookings.length > 0 ? (
              bookings.map((booking: any) => {
                const status = booking.paymentStatus || 'pending';
                const roomName = booking.room?.title || 'N/A';
                const imageUrl = booking.paymentScreenshot?.url 
                  ? `${STRAPI_URL}${booking.paymentScreenshot.url}` 
                  : null;

                return (
                  <div
                    key={booking.documentId}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition hover:shadow-xl"
                  >
                    <div className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                            {roomName}
                          </h3>
                          <div className="mt-1 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                            <p>📅 {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</p>
                            <p>👤 {booking.guestName}</p>
                            <p>📧 {booking.email}</p>
                          </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full border font-semibold text-sm flex items-center gap-2 ${getStatusColor(status)}`}>
                          <span>{getStatusIcon(status)}</span>
                          <span className="uppercase">{status}</span>
                        </div>
                      </div>

                      {/* Payment Screenshot */}
                      {imageUrl && (
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📸 Payment Screenshot</p>
                          <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img
                              src={imageUrl}
                              alt="Payment Screenshot"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Status Notes */}
                      {status === 'approved' && (
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800">
                          <p className="text-green-700 dark:text-green-300 text-sm">
                            ✅ Your booking has been confirmed! We look forward to welcoming you.
                          </p>
                        </div>
                      )}
                      {status === 'rejected' && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-800">
                          <p className="text-red-700 dark:text-red-300 text-sm">
                            ❌ Your booking was not approved. Please contact us for more information.
                          </p>
                        </div>
                      )}
                      {status === 'pending' && (
                        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl border border-yellow-200 dark:border-yellow-800">
                          <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                            ⏳ Your booking is pending review. We'll update you once it's confirmed.
                          </p>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Booking Reference: <span className="font-mono">{booking.documentId}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              searched && bookings.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300">No Bookings Found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">No bookings found for this email address.</p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}