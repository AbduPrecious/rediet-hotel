'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default function Footer() {
  const [hotelInfo, setHotelInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHotelInfo() {
      try {
        const res = await fetch(`${STRAPI_URL}/api/hotel-info`);
        const data = await res.json();
        setHotelInfo(data.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch hotel info:', error);
        setLoading(false);
      }
    }
    fetchHotelInfo();
  }, []);

  const currentYear = new Date().getFullYear();

  if (loading) {
    return (
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-400">Loading...</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-800">
          
          {/* Column 1: Brand */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {hotelInfo?.hotelName || 'Rediet Hotel'}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mt-3">
              {hotelInfo?.description || 'Experience luxury and comfort in the heart of Shashamane.'}
            </p>
          
{/* Social Links */}
<div className="flex items-center gap-5 mt-6">

  {hotelInfo?.facebook && (
    <a
      href={hotelInfo.facebook}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Facebook"
      className="text-gray-400 hover:text-[#1877F2] transition duration-300 hover:scale-110"
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12A12 12 0 1 0 10.9 23.88V15.5H7.9V12h3V9.35c0-2.98 1.78-4.63 4.5-4.63 1.3 0 2.66.23 2.66.23v2.93h-1.5c-1.48 0-1.94.92-1.94 1.87V12h3.3l-.53 3.5h-2.77v8.38A12 12 0 0 0 24 12Z"/>
      </svg>
    </a>
  )}

  {hotelInfo?.twitter && (
    <a
      href={hotelInfo.twitter}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Twitter"
      className="text-gray-400 hover:text-white transition duration-300 hover:scale-110"
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2H21.5l-7.11 8.12L23 22h-6.73l-5.27-6.9L4.95 22H1.7l7.61-8.7L1 2h6.9l4.76 6.26L18.244 2z"/>
      </svg>
    </a>
  )}

  {hotelInfo?.instagram && (
    <a
      href={hotelInfo.instagram}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
      className="text-gray-400 hover:text-[#E4405F] transition duration-300 hover:scale-110"
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zm5-3a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"/>
      </svg>
    </a>
  )}

  {hotelInfo?.youtube && (
    <a
      href={hotelInfo.youtube}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="YouTube"
      className="text-gray-400 hover:text-[#FF0000] transition duration-300 hover:scale-110"
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 61 61 0 0 0 0 12a61 61 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A61 61 0 0 0 24 12a61 61 0 0 0-.5-5.8ZM9.5 15.5v-7l6 3.5-6 3.5Z"/>
      </svg>
    </a>
  )}

  {hotelInfo?.linkedin && (
    <a
      href={hotelInfo.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="LinkedIn"
      className="text-gray-400 hover:text-[#0A66C2] transition duration-300 hover:scale-110"
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4.98 3.5A1.98 1.98 0 1 1 3 1.5a1.98 1.98 0 0 1 1.98 2ZM1.5 8h3V22h-3Zm7 0h2.88v1.91h.04c.4-.76 1.38-1.56 2.84-1.56 3.04 0 3.6 2 3.6 4.59V22h-3v-7.02c0-1.68-.03-3.84-2.34-3.84-2.35 0-2.71 1.83-2.71 3.72V22h-3Z"/>
      </svg>
    </a>
  )}

</div>


          </div>

         {/* Column 2: Quick Links */}
<div>
  <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
  <ul className="space-y-3 text-sm">
    <li>
      <Link href="/" className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group">
        <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
        Home
      </Link>
    </li>
    <li>
      <Link href="/#rooms" className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group">
        <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
        Rooms
      </Link>
    </li>
    <li>
      {hotelInfo?.menuLink ? (
        <a
          href={hotelInfo.menuLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group"
        >
          <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
          Menu
        </a>
      ) : (
        <Link href="/#amenities" className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group">
          <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
          Amenities
        </Link>
      )}
    </li>
    <li>
      <Link href="/about" className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group">
        <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
        About Us
      </Link>
    </li>
    <li>
      <Link href="/contact" className="text-gray-400 hover:text-blue-400 transition flex items-center gap-2 group">
        <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
        Contact
      </Link>
    </li>
  </ul>
</div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-gray-400">
                <span className="text-blue-400 mt-0.5">📍</span>
                <span>{hotelInfo?.address || 'Shashamane 1000, Ethiopia'}</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <span className="text-blue-400 mt-0.5">📞</span>
                <span>{hotelInfo?.phone || '091 636 6763'}</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <span className="text-blue-400 mt-0.5">✉️</span>
                <span>{hotelInfo?.email || 'info@rediethotel.com'}</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <span className="text-blue-400 mt-0.5">🕐</span>
                <span>24/7 - Always Open</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Stay Connected</h4>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe for exclusive offers and updates.
            </p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:shadow-lg transition transform hover:scale-[1.02]"
              >
                Subscribe
              </button>
            </form>
            <p className="text-gray-500 text-xs mt-2">No spam, unsubscribe anytime.</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} {hotelInfo?.hotelName || 'Rediet Hotel'}. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-300 transition">Privacy Policy</Link>
            <Link href="/" className="hover:text-gray-300 transition">Terms of Service</Link>
            <Link href="/contact" className="hover:text-gray-300 transition">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}