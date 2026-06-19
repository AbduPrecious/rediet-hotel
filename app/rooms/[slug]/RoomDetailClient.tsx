'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBooking } from '@/lib/strapi';
import NavbarWrapper from '@/app/components/NavbarWrapper';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// ===== HELPER: RENDER DESCRIPTION =====
const renderDescription = (desc: any) => {
  if (!desc) return 'Comfortable room with modern amenities.';
  if (typeof desc === 'string') return desc;
  if (Array.isArray(desc)) {
    try {
      const text = desc
        .map((block: any) => {
          if (block.children && Array.isArray(block.children)) {
            return block.children
              .map((child: any) => child.text || '')
              .join('');
          }
          return '';
        })
        .join(' ');
      return text || 'Comfortable room with modern amenities.';
    } catch {
      return 'Comfortable room with modern amenities.';
    }
  }
  if (typeof desc === 'object' && desc.children) {
    try {
      if (Array.isArray(desc.children)) {
        return desc.children.map((child: any) => child.text || '').join('');
      }
      return desc.children.text || 'Comfortable room with modern amenities.';
    } catch {
      return 'Comfortable room with modern amenities.';
    }
  }
  return 'Comfortable room with modern amenities.';
};

// ===== HELPER: GET ICON FOR AMENITY =====
const getAmenityIcon = (amenity: string) => {
  const lower = amenity.toLowerCase();
  if (lower.includes('wifi') || lower.includes('internet')) return '📶';
  if (lower.includes('tv') || lower.includes('television')) return '📺';
  if (lower.includes('pool') || lower.includes('swimming')) return '🏊';
  if (lower.includes('gym') || lower.includes('fitness')) return '💪';
  if (lower.includes('spa') || lower.includes('massage')) return '🧖';
  if (lower.includes('restaurant') || lower.includes('bar')) return '🍽️';
  if (lower.includes('coffee') || lower.includes('tea')) return '☕';
  if (lower.includes('parking')) return '🅿️';
  if (lower.includes('air') || lower.includes('ac')) return '❄️';
  if (lower.includes('view') || lower.includes('ocean') || lower.includes('mountain')) return '🌅';
  if (lower.includes('family') || lower.includes('kids')) return '👨‍👩‍👧‍👦';
  if (lower.includes('pet')) return '🐾';
  if (lower.includes('desk') || lower.includes('meeting')) return '💼';
  if (lower.includes('butler') || lower.includes('private') || lower.includes('exclusive')) return '👑';
  if (lower.includes('terrace') || lower.includes('balcony')) return '🌿';
  return '✨';
};

// ===== LIGHTBOX COMPONENT =====
function ImageLightbox({ images, initialIndex, onClose }: {
  images: any[],
  initialIndex: number,
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition z-[1000]"
      >
        ✕
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); goToPrev(); }}
        className="absolute left-4 text-white text-4xl hover:text-gray-300 transition z-[1000]"
      >
        ‹
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); goToNext(); }}
        className="absolute right-4 text-white text-4xl hover:text-gray-300 transition z-[1000]"
      >
        ›
      </button>

      <div
        className="relative max-w-5xl max-h-[90vh] w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {currentImage && (
          <img
            src={`${STRAPI_URL}${currentImage.url}`}
            alt={currentImage.alternativeText || 'Room image'}
            className="w-full h-full object-contain"
          />
        )}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}

// ===== CLIENT COMPONENT =====
export default function RoomDetailClient({ room, slug, hotelName }: { room: any; slug: string; hotelName?: string }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Booking States
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [bookingMessage, setBookingMessage] = useState('');

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700">
        <div className="text-center p-8 max-w-2xl bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-4">Room Not Found</h1>
          <p className="text-gray-300 mb-6">The room you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-medium hover:shadow-2xl transition transform hover:scale-105"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const roomImages = room.images || [];

// ===== BOOKING HANDLER - WITH REDIRECT =====
const handleBookingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setBookingStatus('loading');
  setBookingMessage('Processing...');

  const formData = new FormData(e.currentTarget);
  const guestName = formData.get('guestName') as string;
  const guestEmail = formData.get('guestEmail') as string;
  const guestPhone = formData.get('guestPhone') as string;
  const checkIn = formData.get('checkIn') as string;
  const checkOut = formData.get('checkOut') as string;
  const guests = formData.get('guests') as string;
  const specialRequests = formData.get('specialRequests') as string || '';

  if (!guestName || !guestEmail || !guestPhone || !checkIn || !checkOut) {
    setBookingStatus('error');
    setBookingMessage('❌ Please fill in all fields');
    setTimeout(() => setBookingStatus('idle'), 3000);
    return;
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  if (checkOutDate <= checkInDate) {
    setBookingStatus('error');
    setBookingMessage('❌ Check-out must be after check-in');
    setTimeout(() => setBookingStatus('idle'), 3000);
    return;
  }

  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice = nights * room.price;

  const bookingData = {
    guestName: guestName,
    email: guestEmail,
    phone: guestPhone,
    checkIn: checkIn,
    checkOut: checkOut,
    numberOfGuests: parseInt(guests),
    totalPrice: totalPrice,
    statuss: 'pending',
    specialRequests: specialRequests,
  };

  console.log('📤 Sending booking data:', bookingData);

  try {
    const result = await createBooking(bookingData);
    console.log('✅ SUCCESS:', result);
    
    // ✅ REDIRECT TO CONFIRMATION PAGE
    const params = new URLSearchParams({
      name: guestName,
      email: guestEmail,
      checkIn: checkIn,
      checkOut: checkOut,
      guests: guests,
      totalPrice: totalPrice.toString(),
      roomName: room.title,
    });

    window.location.href = `/booking-confirmation?${params.toString()}`;
    
  } catch (error: any) {
    console.error('❌ ERROR:', error);
    setBookingStatus('error');
    setBookingMessage('❌ Failed to create booking. Please try again.');
    setTimeout(() => {
      setBookingStatus('idle');
      setBookingMessage('');
    }, 5000);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <NavbarWrapper hotelName={hotelName || 'Rediet Hotel'} />

      {/* ===== HERO IMAGE SECTION ===== */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden mb-8 md:mb-12 bg-gray-900 dark:bg-gray-950">
        {roomImages[0]?.url ? (
          <div className="relative w-full h-full">
            <img
              src={`${STRAPI_URL}${roomImages[0].url}`}
              alt={room.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white text-6xl">🏨</span>
          </div>
        )}

        {/* Room Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <Link
              href="/#rooms"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition mb-3 group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Rooms
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-2xl">
              {room.title}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-white/90 text-sm md:text-base">⭐ {room.featured ? 'Featured Room' : 'Premium Room'}</span>
              <span className="w-1 h-1 bg-white/50 rounded-full"></span>
              <span className="text-white/90 text-sm md:text-base">👤 {room.capacity || 2} Guests</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* ===== THUMBNAIL GRID ===== */}
            {roomImages.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {/* Image 2 - if exists */}
                {roomImages[1] && (
                  <div
                    onClick={() => {
                      setSelectedImageIndex(1);
                      setLightboxOpen(true);
                    }}
                    className="group relative h-40 md:h-48 rounded-xl overflow-hidden bg-gray-200 cursor-pointer shadow-md hover:shadow-xl transition-all duration-400 hover:-translate-y-1"
                  >
                    <img
                      src={`${STRAPI_URL}${roomImages[1].url}`}
                      alt={`${room.title} - Image 2`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                      <span className="bg-white/15 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium border border-white/20 shadow-xl transform group-hover:scale-105 transition duration-300 flex items-center gap-1.5">
                        <span className="text-base">🔍</span> Click to enlarge
                      </span>
                    </div>
                  </div>
                )}

                {/* Image 3 - if exists */}
                {roomImages[2] && (
                  <div
                    onClick={() => {
                      setSelectedImageIndex(2);
                      setLightboxOpen(true);
                    }}
                    className="group relative h-40 md:h-48 rounded-xl overflow-hidden bg-gray-200 cursor-pointer shadow-md hover:shadow-xl transition-all duration-400 hover:-translate-y-1"
                  >
                    <img
                      src={`${STRAPI_URL}${roomImages[2].url}`}
                      alt={`${room.title} - Image 3`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                      <span className="bg-white/15 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium border border-white/20 shadow-xl transform group-hover:scale-105 transition duration-300 flex items-center gap-1.5">
                        <span className="text-base">🔍</span> Click to enlarge
                      </span>
                    </div>
                  </div>
                )}

                {/* Image 4 - if exists */}
                {roomImages[3] && (
                  <div
                    onClick={() => {
                      setSelectedImageIndex(3);
                      setLightboxOpen(true);
                    }}
                    className="group relative h-40 md:h-48 rounded-xl overflow-hidden bg-gray-200 cursor-pointer shadow-md hover:shadow-xl transition-all duration-400 hover:-translate-y-1"
                  >
                    <img
                      src={`${STRAPI_URL}${roomImages[3].url}`}
                      alt={`${room.title} - Image 4`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                      <span className="bg-white/15 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium border border-white/20 shadow-xl transform group-hover:scale-105 transition duration-300 flex items-center gap-1.5">
                        <span className="text-base">🔍</span> Click to enlarge
                      </span>
                    </div>
                  </div>
                )}

                {/* HERO IMAGE - bottom right (always shows) */}
                <div
                  onClick={() => {
                    setSelectedImageIndex(0);
                    setLightboxOpen(true);
                  }}
                  className="group relative h-40 md:h-48 rounded-xl overflow-hidden bg-gray-200 cursor-pointer shadow-md hover:shadow-xl transition-all duration-400 hover:-translate-y-1"
                >
                  <img
                    src={`${STRAPI_URL}${roomImages[0].url}`}
                    alt={`${room.title} - Hero`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                    <span className="bg-white/15 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium border border-white/20 shadow-xl transform group-hover:scale-105 transition duration-300 flex items-center gap-1.5">
                      <span className="text-base">🔍</span> Click to enlarge
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Description Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100/50 dark:border-gray-700 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">📖</span> Description
              </h2>
              <div className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed">
                {renderDescription(room.description)}
              </div>
            </div>

            {/* Amenities Card */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100/50 dark:border-gray-700 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-3xl">✨</span> Amenities
                </h2>
                <div className="flex flex-wrap gap-3">
                  {room.amenities.map((item: string, index: number) => {
                    const icon = getAmenityIcon(item);
                    const colors = [
                      'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
                      'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
                      'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
                      'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
                      'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100',
                      'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
                    ];
                    const color = colors[index % colors.length];

                    return (
                      <span
                        key={index}
                        className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-full border ${color} transition-all duration-300 hover:scale-105 hover:shadow-md cursor-default`}
                      >
                        <span className="text-lg">{icon}</span>
                        {item}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ===== RIGHT COLUMN: Booking Widget ===== */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100/50 dark:border-gray-700 transition-colors duration-300">

                {/* Price */}
                <div className="text-center pb-4 mb-4 border-b-2 border-gray-100/80 dark:border-gray-700">
                  <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ETB {room.price}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm md:text-base ml-1">/ night</span>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-4 text-center border border-blue-200/50 dark:border-blue-800/50">
                    <div className="text-3xl mb-1">👤</div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{room.capacity || 2} Guests</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl p-4 text-center border border-purple-200/50 dark:border-purple-800/50">
                    <div className="text-3xl mb-1">🛏️</div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{room.bedType || 'Standard'}</p>
                  </div>
                </div>

                {/* Booking Form */}
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  {/* Status Messages */}
                  {bookingStatus === 'error' && (
                    <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 p-4 rounded-2xl text-center text-sm">
                      {bookingMessage}
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1.5 flex items-center gap-1">
                      👤 Full Name
                    </label>
                    <input
                      type="text"
                      name="guestName"
                      placeholder="John Doe"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-white dark:bg-gray-900/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1.5 flex items-center gap-1">
                      📧 Email
                    </label>
                    <input
                      type="email"
                      name="guestEmail"
                      placeholder="john@example.com"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-white dark:bg-gray-900/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1.5 flex items-center gap-1">
                      📞 Phone
                    </label>
                    <input
                      type="tel"
                      name="guestPhone"
                      placeholder="+251 911 123 456"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-white dark:bg-gray-900/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1.5 flex items-center gap-1">
                      📅 Check In
                    </label>
                    <input
                      type="date"
                      name="checkIn"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-white dark:bg-gray-900/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1.5 flex items-center gap-1">
                      📅 Check Out
                    </label>
                    <input
                      type="date"
                      name="checkOut"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-white dark:bg-gray-900/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1.5 flex items-center gap-1">
                      👥 Guests
                    </label>
                    <select
                      name="guests"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-white dark:bg-gray-900/50"
                    >
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-1.5 flex items-center gap-1">
                      📝 Special Requests (Optional)
                    </label>
                    <textarea
                      name="specialRequests"
                      placeholder="Any special requests?"
                      rows={2}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 dark:text-white dark:bg-gray-900/50 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bookingStatus === 'loading'}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {bookingStatus === 'loading' ? 'Processing...' : 'Book Now'}
                  </button>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">🔒 Secure booking • You won't be charged yet</p>

                  {/* ===== SUCCESS MESSAGE BELOW BOOK BUTTON ===== */}
                  {bookingStatus === 'success' && (
                    <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 p-5 rounded-2xl text-center mt-2 animate-fade-in">
                      <p className="font-semibold text-lg">Booking Confirmed Successfully!</p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ===== LIGHTBOX ===== */}
      {lightboxOpen && (
        <ImageLightbox
          images={roomImages}
          initialIndex={selectedImageIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

    </div>
  );
}