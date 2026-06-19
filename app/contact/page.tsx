'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import NavbarWrapper from '@/app/components/NavbarWrapper';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// ===== CONTACT FORM COMPONENT =====
export default function ContactPage() {
  const [hotelInfo, setHotelInfo] = useState<any>(null);
  const [contactData, setContactData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // ===== FETCH DATA ON CLIENT =====
  useEffect(() => {
    async function fetchData() {
      try {
        const hotelRes = await fetch(`${STRAPI_URL}/api/hotel-info`);
        const hotelData = await hotelRes.json();
        setHotelInfo(hotelData.data);

        const contactRes = await fetch(`${STRAPI_URL}/api/contact`);
        const contactData = await contactRes.json();
        setContactData(contactData.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    }
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('Sending your message...');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('✅ Message sent successfully! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
        
      } else {
        setStatus('error');
        setMessage(`❌ ${data.error || 'Failed to send message. Please try again.'}`);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      }
    } catch (error) {
      setStatus('error');
      setMessage('❌ Failed to send message. Please try again.');
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-white">

      <NavbarWrapper hotelName={hotelInfo?.hotelName} />

      {/* ===== HERO SECTION ===== */}
      <section className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <div className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-6 py-2 rounded-full mb-6 border border-white/30">
            📞 Get in Touch
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {contactData?.title || 'Contact Us'}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {contactData?.description || 'We\'d love to hear from you. Reach out to us for any inquiries or bookings.'}
          </p>
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* LEFT: Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
                <p className="text-gray-600 mb-6">
                  Have questions or ready to book? Reach out to us and we'll get back to you as soon as possible.
                </p>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl hover:shadow-md transition">
                <div className="text-2xl mt-1">📍</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Address</h4>
                  <p className="text-gray-600 text-sm">{hotelInfo?.address || 'Shashamane 1000, Ethiopia'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl hover:shadow-md transition">
                <div className="text-2xl mt-1">📞</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Phone</h4>
                  <p className="text-gray-600 text-sm">{hotelInfo?.phone || '091 636 6763'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl hover:shadow-md transition">
                <div className="text-2xl mt-1">✉️</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Email</h4>
                  <p className="text-gray-600 text-sm">{hotelInfo?.email || 'info@rediethotel.com'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl hover:shadow-md transition">
                <div className="text-2xl mt-1">🕐</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Working Hours</h4>
                  <p className="text-gray-600 text-sm">{contactData?.workingHours || '24/7 - Always Open'}</p>
                </div>
              </div>
            </div>

            {/* RIGHT: Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-3xl p-8 md:p-10 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+251 911 123 456"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Booking Inquiry"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Tell us how we can help..."
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? 'Sending...' : 'Send Message 📤'}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    We'll respond within 24 hours
                  </p>

                  {/* ===== SUCCESS/ERROR MESSAGE BELOW SUBMIT BUTTON ONLY ===== */}
                  {status === 'success' && (
                    <div className="bg-green-50 border-2 border-green-400 text-green-700 p-4 rounded-2xl text-center mt-4 animate-fade-in">
                      <div className="text-2xl mb-1">✅</div>
                      <p className="font-semibold">{message}</p>
                    </div>
                  )}
                  {status === 'error' && (
                    <div className="bg-red-50 border-2 border-red-400 text-red-700 p-4 rounded-2xl text-center mt-4 animate-fade-in">
                      <div className="text-2xl mb-1">❌</div>
                      <p className="font-semibold">{message}</p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== GOOGLE MAPS ===== */}
      <section className="py-0">
        <div className="w-full h-80 bg-gray-200 relative">
          {contactData?.googleMapsEmbed ? (
            <iframe
              src={contactData.googleMapsEmbed}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="filter grayscale hover:grayscale-0 transition duration-700"
            ></iframe>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-gray-400">
              📍 Map Coming Soon
            </div>
          )}
        </div>
      </section>

    
    </div>
  );
}