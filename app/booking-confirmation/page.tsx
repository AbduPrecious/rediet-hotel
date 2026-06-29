'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import NavbarWrapper from '@/app/components/NavbarWrapper';

// Separate component that uses useSearchParams
function ConfirmationContent() {
  const searchParams = useSearchParams();
  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');
    const totalPrice = searchParams.get('totalPrice');
    const roomName = searchParams.get('roomName');

    // ✅ Save user info to localStorage for dashboard
    if (name && email) {
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
    }

    setBookingData({
      name,
      email,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      roomName,
    });
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  if (!bookingData || !bookingData.name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading booking details...</h2>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const bookingRef = `RH-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <NavbarWrapper hotelName="Rediet Hotel - Shashamane" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12" id="receipt-container">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden transition-colors duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl md:text-4xl font-bold">Booking Confirmed!</h1>
            <p className="text-green-100 mt-2">Your stay at Rediet Hotel is confirmed</p>
          </div>

          <div className="p-8 md:p-10">
            {/* Booking Reference */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Booking Reference</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white tracking-wider">{bookingRef}</p>
            </div>

            <div className="text-center mb-8">
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                Thank you, <strong>{bookingData.name}</strong>! Your booking has been successfully confirmed.
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                We've sent a confirmation email to <strong>{bookingData.email}</strong>
              </p>
            </div>

            {/* Booking Details */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                📋 Booking Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-600 dark:text-gray-400">Booking Reference</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{bookingRef}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-600 dark:text-gray-400">Room</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{bookingData.roomName || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-600 dark:text-gray-400">Guest Name</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{bookingData.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-600 dark:text-gray-400">Email</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{bookingData.email}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-600 dark:text-gray-400">Check In</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{formatDate(bookingData.checkIn)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-600 dark:text-gray-400">Check Out</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{formatDate(bookingData.checkOut)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                  <span className="text-gray-600 dark:text-gray-400">Guests</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{bookingData.guests} {parseInt(bookingData.guests) === 1 ? 'Guest' : 'Guests'}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-600 dark:text-gray-400 font-bold">Total Price</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">ETB {bookingData.totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-6 mb-8 border border-blue-200 dark:border-blue-800 no-print-section">
              <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                📌 What's Next?
              </h3>
              <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 dark:text-blue-400">📧</span>
                  <span>You'll receive a confirmation email shortly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 dark:text-blue-400">📞</span>
                  <span>Our team will contact you 24 hours before check-in</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 dark:text-blue-400">🆔</span>
                  <span>Please bring this receipt and a valid ID for check-in</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons - Better Visibility in Light Mode */}
<div className="flex flex-col sm:flex-row gap-4 no-print">
  <button
    onClick={handlePrint}
    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3.5 rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
    🖨️ Print Receipt
  </button>
  <Link
    href="/dashboard"
    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-3.5 rounded-xl font-semibold transition transform hover:scale-[1.02] shadow-md"
  >
    📊 My Dashboard
  </Link>
  <Link
    href="/"
    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-center py-3.5 rounded-xl font-semibold transition transform hover:scale-[1.02]"
  >
    🏠 Back to Home
  </Link>
</div>
          </div>
        </div>

        <p className="text-center text-gray-400 dark:text-gray-500 text-sm mt-6">
          If you have any questions, contact us at <span className="text-blue-600 dark:text-blue-400">info@rediethotel.com</span>
        </p>
      </div>
    </div>
  );
}

// ===== MAIN PAGE =====
export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading...</h2>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}