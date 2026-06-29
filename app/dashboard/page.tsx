'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavbarWrapper from '@/app/components/NavbarWrapper';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default function DashboardPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    const storedName = localStorage.getItem('userName');
    
    if (storedEmail) {
      setUserEmail(storedEmail);
      setUserName(storedName || 'Guest');
      fetchBookings(storedEmail);
    } else {
      setLoading(false);
      setShowLogin(true);
    }
  }, []);

  const fetchBookings = async (email: string) => {
    setLoading(true);
    try {
      console.log('🔍 Fetching bookings for email:', email);
      
      const res = await fetch(
        `${STRAPI_URL}/api/bookings?filters[email][$eq]=${encodeURIComponent(email)}&populate[room][fields][0]=title&populate[paymentScreenshot][fields][0]=url&sort=createdAt:desc`
      );
      const data = await res.json();
      console.log('📊 Bookings data:', JSON.stringify(data, null, 2));
      
      if (data.data) {
        setBookings(data.data);
      }
      setShowLogin(false);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (userEmail) {
      setRefreshing(true);
      fetchBookings(userEmail);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      setLoginError('Please enter your email');
      return;
    }
    
    setLoading(true);
    setIsChecking(true);
    setLoginError('');
    
    try {
      const checkRes = await fetch(
        `${STRAPI_URL}/api/bookings?filters[email][$eq]=${encodeURIComponent(loginEmail)}`
      );
      const checkData = await checkRes.json();
      
      console.log('🔍 Checking email:', loginEmail);
      console.log('📊 Found bookings:', checkData.data?.length || 0);
      
      if (!checkData.data || checkData.data.length === 0) {
        setLoginError('❌ No bookings found for this email. Please make a booking first.');
        setLoading(false);
        setIsChecking(false);
        return;
      }
      
      localStorage.setItem('userEmail', loginEmail);
      localStorage.setItem('userName', loginEmail.split('@')[0]);
      setUserEmail(loginEmail);
      setUserName(loginEmail.split('@')[0]);
      fetchBookings(loginEmail);
      
    } catch (error) {
      console.error('Error checking bookings:', error);
      setLoginError('❌ Failed to verify email. Please try again.');
      setLoading(false);
      setIsChecking(false);
    }
  };

  // ✅ Logout function
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    // Reset state
    setUserEmail('');
    setUserName('');
    setBookings([]);
    // Show login screen
    setShowLogin(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700';
      case 'pending':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700';
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

  const getStatusMessage = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '✅ Your booking has been confirmed! We look forward to welcoming you.';
      case 'rejected':
        return '❌ Your booking was not approved. Please contact us for more information.';
      case 'pending':
      default:
        return '⏳ Your booking is pending review. We\'ll update you once confirmed.';
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

  // Stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.paymentStatus === 'pending' || !b.paymentStatus).length;
  const approvedBookings = bookings.filter(b => b.paymentStatus === 'approved').length;
  const rejectedBookings = bookings.filter(b => b.paymentStatus === 'rejected').length;

  // Show login screen if no email
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <NavbarWrapper hotelName="Rediet Hotel  Shashamane" />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-10 max-w-md w-full border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Welcome Back</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Enter your email to view your bookings</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-white dark:bg-gray-900/50 transition"
                    required
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl">
                  <p className="text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {loginError}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isChecking}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isChecking ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </>
                ) : (
                  <>
                    View My Bookings
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                👋 You'll receive a confirmation email after booking
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <NavbarWrapper hotelName="Rediet Hotel- Shashamane" />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading your bookings...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <NavbarWrapper hotelName="Rediet Hotel  Shashamane" />

      {/* ===== DASHBOARD HEADER ===== */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold">👋 Welcome, <span className="text-yellow-300">{userName}</span>!</h1>
              <p className="text-blue-100 mt-2 text-lg">Here's a summary of your bookings at Rediet Hotel</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/20 backdrop-blur-sm text-white px-5 py-3 rounded-xl font-semibold hover:bg-white/30 transition border border-white/30 flex items-center gap-2 disabled:opacity-50"
              >
                <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? 'Updating...' : 'Refresh'}
              </button>
              <Link
                href="/rooms"
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition border border-white/30"
              >
                📅 Book a New Room
              </Link>
              {/* ✅ Logout Button - Fixed */}
              <button
                onClick={handleLogout}
                className="bg-white/10 backdrop-blur-sm text-white px-4 py-3 rounded-xl font-semibold hover:bg-white/20 transition border border-white/20 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center border border-gray-100 dark:border-gray-700 hover:shadow-xl transition">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{totalBookings}</div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Total Bookings</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center border border-gray-100 dark:border-gray-700 hover:shadow-xl transition">
            <div className="text-4xl font-bold text-amber-500 dark:text-amber-400">{pendingBookings}</div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">⏳ Pending</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center border border-gray-100 dark:border-gray-700 hover:shadow-xl transition">
            <div className="text-4xl font-bold text-emerald-500 dark:text-emerald-400">{approvedBookings}</div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">✅ Approved</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center border border-gray-100 dark:border-gray-700 hover:shadow-xl transition">
            <div className="text-4xl font-bold text-rose-500 dark:text-rose-400">{rejectedBookings}</div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">❌ Rejected</div>
          </div>
        </div>
      </div>

      {/* ===== BOOKINGS LIST ===== */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">📋 Your Bookings</h2>
          {bookings.length > 0 && (
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-1.5 rounded-full">
              {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
            </span>
          )}
        </div>

        {bookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-5">
            {bookings.map((booking: any) => {
              const roomName = booking.room?.title 
                || booking.room?.name 
                || 'Room information not available';
              
              const status = booking.paymentStatus || 'pending';
              const imageUrl = booking.paymentScreenshot?.url 
                ? `${STRAPI_URL}${booking.paymentScreenshot.url}` 
                : null;

              return (
                <div
                  key={booking.documentId}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        🏨 {roomName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full border font-semibold text-sm flex items-center gap-1.5 ${getStatusColor(status)}`}>
                        <span>{getStatusIcon(status)}</span>
                        <span className="uppercase">{status}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Check In</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{formatDate(booking.checkIn)}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Check Out</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{formatDate(booking.checkOut)}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Guests</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">👤 {booking.numberOfGuests || 1}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Price</p>
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">ETB {booking.totalPrice}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-base font-medium text-gray-700 dark:text-gray-300">
                      <span>👤 {booking.guestName}</span>
                      <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                      <span>📧 {booking.email}</span>
                      {booking.specialRequests && (
                        <>
                          <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                          <span className="text-amber-600 dark:text-amber-400">📝 {booking.specialRequests}</span>
                        </>
                      )}
                    </div>

                    {imageUrl && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">📸 Payment Screenshot</p>
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:scale-105 transition">
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

                    <div className={`mt-4 p-4 rounded-xl border ${getStatusColor(status)}`}>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {getStatusMessage(status)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-7xl mb-4">🏨</div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300">No Bookings Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">You haven't made any bookings yet.</p>
            <Link
              href="/rooms"
              className="inline-block mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:shadow-xl transition transform hover:scale-[1.02]"
            >
              Browse Rooms
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}