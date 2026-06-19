// frontend/app/booking/page.tsx - Simple version without date-fns
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default function BookingPage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');
  const roomTitle = searchParams.get('roomTitle');
  const roomPrice = searchParams.get('price');

  const [isLoading, setIsLoading] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Calculate nights and total
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nights = calculateNights();
  const totalPrice = nights * parseFloat(roomPrice || '0');
  const taxes = Math.round(totalPrice * 0.15);
  const grandTotal = totalPrice + taxes;

  if (!roomId || !roomTitle || !roomPrice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-xl">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">No Room Selected</h1>
          <p className="text-slate-600 mb-6">Please select a room first.</p>
          <Link href="/rooms" className="bg-blue-600 text-white px-6 py-3 rounded-xl inline-block">
            Browse Rooms
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone || !checkIn || !checkOut) {
      alert('Please fill in all required fields');
      return;
    }

    if (nights <= 0) {
      alert('Please select valid dates');
      return;
    }

    setIsLoading(true);

    const bookingData = {
      data: {
        guestName,
        guestEmail,
        guestPhone,
        room: roomId,
        checkIn,
        checkOut,
        nights,
        totalPrice: grandTotal,
        specialRequests,
        status: 'pending'
      }
    };

    try {
      const response = await fetch(`${STRAPI_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          window.location.href = '/rooms';
        }, 3000);
      } else {
        alert('Booking failed. Please try again.');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl animate-bounce">
          <div className="text-7xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-600 mb-4">Thank you, {guestName}!</p>
          <p className="text-slate-500">Redirecting to rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <Link href={`/rooms/${roomId}`} className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
          ← Back to Room
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                <h1 className="text-3xl font-bold text-white">Complete Your Booking</h1>
                <p className="text-white/80 mt-1">You're booking <strong>{decodeURIComponent(roomTitle)}</strong></p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Date Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-900 mb-2">Check-in Date *</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-900 mb-2">Check-out Date *</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {nights > 0 && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-blue-800 font-medium">
                      📅 {nights} night{nights !== 1 ? 's' : ''} stay
                    </p>
                  </div>
                )}

                {/* Guest Info */}
                <div className="space-y-4">
                  <h3 className="font-bold text-xl text-slate-900">Guest Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address *"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <textarea
                    placeholder="Special Requests (Optional)"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : `Confirm Booking - $${grandTotal}`}
                </button>
              </form>
            </div>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Price Summary</h3>
              <div className="space-y-3 text-slate-600">
                <div className="flex justify-between">
                  <span>${roomPrice} × {nights || 0} nights</span>
                  <span>${totalPrice || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & fees (15%)</span>
                  <span>${taxes || 0}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold text-xl text-slate-900">
                    <span>Total</span>
                    <span className="text-blue-600">${grandTotal || 0}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <span className="font-bold">✓ Free cancellation</span> up to 48 hours<br />
                  <span className="font-bold">✓ Best price guarantee</span><br />
                  <span className="font-bold">✓ No hidden fees</span>
                </p>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 rounded-xl">
                <p className="text-xs text-yellow-800">
                  💳 Pay at hotel. No payment required now.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}