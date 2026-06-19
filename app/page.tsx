import { fetchAPI, getHotelInfo } from '@/lib/strapi';
import { Room, StrapiResponse } from '@/types/strapi';
import Link from 'next/link';
import NavbarWrapper from '@/app/components/NavbarWrapper';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface Review {
  id: number;
  documentId: string;
  guestName: string;
  rating: number;
  comment: string;      // ✅ This is the review text
  room?: {
    title: string;
  };
  booking?: {
    // booking fields if needed
  };
  dateOfStay?: string;
  avatar?: {
    url: string;
    alternativeText?: string;
  };
  relatedRoom?: {
    title: string;
  };
}

interface Amenity {
  id: number;
  documentId: string;
  name: string;
  image?: {
    url: string;
    alternativeText?: string;
  };
  description: string;
  order: number;
}

async function getRooms(): Promise<Room[]> {
  try {
    const response: StrapiResponse<Room[]> = await fetchAPI('/rooms?populate=*');
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    return [];
  }
}

async function getReviews(): Promise<Review[]> {
  try {
    // ✅ Most compatible version
    const response: StrapiResponse<Review[]> = await fetchAPI('/reviews?populate=*');
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return [];
  }
}
async function getAmenities(): Promise<Amenity[]> {
  try {
    const response: StrapiResponse<Amenity[]> = await fetchAPI('/amenities?populate=image');
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch amenities:', error);
    return [];
  }
}

// Helper function to safely render description from Strapi rich text
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

// Helper function to get icon for amenity
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

export default async function Home() {
  const rooms = await getRooms();
  const hotelInfo = await getHotelInfo();
  const reviews = await getReviews();
  const amenities = await getAmenities();

  const featuredRooms = rooms.filter(room => room.featured);
 

  const heroImageUrl = hotelInfo?.heroImage?.url 
    ? `${STRAPI_URL}${hotelInfo.heroImage.url}` 
    : null;

  console.log('🖼️ Hero Image URL:', heroImageUrl);
  console.log('🏨 Hotel Info:', hotelInfo);
  console.log('📸 Hero Image Object:', hotelInfo?.heroImage);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">

      {/* ===== NAVBAR ===== */}
      <NavbarWrapper hotelName={hotelInfo?.hotelName} />

      {/* ===== HERO ===== */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {heroImageUrl ? (
          <div className="absolute inset-0 z-0">
            <img
              src={heroImageUrl}
              alt={hotelInfo?.hotelName || 'Rediet Hotel'}
              className="w-full h-full object-cover object-[50%_25%]"
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        )}

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-white/30">
            ✦ Award-Winning Hospitality ✦
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            {hotelInfo?.tagline || 'Experience Luxury in the Heart of Shashamane'}
          </h1>
          
          <p className="text-base md:text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            {hotelInfo?.description || 'Welcome to Rediet Hotel Shashamane, where comfort meets elegance.'}
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#rooms"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 md:px-8 py-3 rounded-full font-medium hover:shadow-xl transition transform hover:scale-105"
            >
              Explore Rooms
            </a>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-6 md:px-8 py-3 rounded-full font-medium hover:bg-white hover:text-gray-800 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURED ROOMS ===== */}
{featuredRooms.length > 0 && (
  <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 scroll-mt-5" id="rooms">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">⭐ Featured Rooms</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Our most popular accommodations</p>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredRooms.map((room) => (
          <div 
            key={room.documentId} 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col h-full"
          >
            <div className="relative h-64 bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
              {room.images?.[0]?.url ? (
                <img
                  src={`${STRAPI_URL}${room.images[0].url}`}
                  alt={room.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
              <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                {room.price} ETB / night
              </div>
            </div>
            
            <div className="p-6 md:p-8 flex flex-col flex-grow">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">{room.title}</h3>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-grow">{renderDescription(room.description)}</p>
              
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

              {/* View Details Button - Always at bottom */}
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
        ))}
      </div>
    </div>
  </section>
)}

      {/* ===== AMENITIES ===== */}
      {amenities.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950 scroll-mt-5" id="amenities">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Facilities</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mt-2">World-Class Amenities</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg max-w-2xl mx-auto">
                Everything you need for a perfect stay
              </p>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {amenities.map((amenity: any) => {
                let imageUrl = null;
                if (amenity.image && amenity.image.url) {
                  if (amenity.image.url.startsWith('http')) {
                    imageUrl = amenity.image.url;
                  } else {
                    imageUrl = `${STRAPI_URL}${amenity.image.url}`;
                  }
                }
                
                return (
                  <div
                    key={amenity.documentId}
                    className="group bg-gray-50 dark:bg-gray-900 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2 cursor-default border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                  >
                    <div className="relative h-40 md:h-48 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={amenity.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-4xl">
                          🏨
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>
                    <div className="p-4 md:p-5 text-center">
                      <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {amenity.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300 mt-1">
                        {amenity.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}


      

    {/* ===== TESTIMONIALS / GUEST REVIEWS ===== */}
{reviews.length > 0 && (
  <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900" id="reviews">
    <div className="max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-12">
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Testimonials</span>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mt-2">
          What Our Guests Say
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-4 rounded-full"></div>
        <p className="text-gray-500 dark:text-gray-400 mt-3 text-base max-w-2xl mx-auto">
          Real reviews from real guests who stayed with us
        </p>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review: any, index: number) => {
          // Avatar
          let avatarUrl = null;
          if (review.avatar?.url) {
            avatarUrl = review.avatar.url.startsWith('http') 
              ? review.avatar.url 
              : `${STRAPI_URL}${review.avatar.url}`;
          }

          // Room name
          const roomName = review.room?.title || review.relatedRoom?.title || null;

          // Format date
          const formatDate = (dateString: string) => {
            if (!dateString) return null;
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          };

          return (
            <div 
              key={review.documentId} 
              className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-400 hover:-translate-y-1.5 border border-gray-200/50 dark:border-gray-700/50 group relative overflow-hidden flex flex-col h-[210px]"
            >
              {/* Decorative gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>

              {/* Rating Stars */}
              <div className="flex gap-0.5 mb-2.5">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`w-5 h-5 ${
                      i < review.rating 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3 flex-1 line-clamp-3">
                "{review.comment}"
              </p>

              {/* Guest Info */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                {/* Avatar */}
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={review.guestName}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20 flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm ring-2 ring-blue-500/20 flex-shrink-0">
                    {review.guestName?.charAt(0) || 'G'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-gray-800 dark:text-white font-semibold text-sm truncate">
                    {review.guestName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {roomName ? `🏨 ${roomName}` : '✨ Verified Guest'}
                    {review.dateOfStay && ` • ${formatDate(review.dateOfStay)}`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
)}
    </div>
  );
}