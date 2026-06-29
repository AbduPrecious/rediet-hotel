import { getRooms } from '@/lib/strapi';
import Link from 'next/link';
import Image from 'next/image';
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

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* ===== NAVBAR ===== */}
      <NavbarWrapper hotelName="Rediet Hotel Shashamane" />

      {/* ===== HERO ===== */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Rooms & Suites</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Find your perfect accommodation with us.
          </p>
        </div>
      </div>

      {/* ===== ROOMS GRID ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room: any) => {
            let imageUrl = '';
            if (room.images && room.images.length > 0 && room.images[0]?.url) {
              imageUrl = room.images[0].url.startsWith('http') 
                ? room.images[0].url 
                : `${STRAPI_URL}${room.images[0].url}`;
            }

            return (
              <div 
                key={room.documentId} 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col h-full"
              >
                {/* Image */}
                <div className="relative h-64 bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={room.title || 'Room image'}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                      No image
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                     {room.price || 0} ETB/ night
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6 md:p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">{room.title || 'Unnamed Room'}</h3>
                  <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-grow">{renderDescription(room.description)}</p>
                  
                  {/* Amenities */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amenities</span>
                      <span className="text-sm bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-medium">
                        {room.amenities?.length || 0}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities?.slice(0, 4).map((item: string, i: number) => {
                        const icon = getAmenityIcon(item);
                        const colors = [
                          'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
                          'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
                          'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
                          'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
                          'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
                          'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
                        ];
                        const color = colors[i % colors.length];
                        
                        return (
                          <span 
                            key={i} 
                            className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border ${color} transition-all duration-300 hover:scale-110 hover:shadow-md cursor-default`}
                          >
                            <span className="text-base">{icon}</span>
                            {item}
                          </span>
                        );
                      })}
                      {room.amenities?.length > 4 && (
                        <span className="inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                          +{room.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* View Details Button */}
                  <Link
                    href={`/rooms/${room.slug}`}
                    className="group relative inline-flex items-center justify-center w-full gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-base font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] overflow-hidden mt-auto"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    <span className="relative flex items-center gap-2">
                      View Details
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}