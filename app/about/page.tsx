import { fetchAPI } from '@/lib/strapi';
import Link from 'next/link';
import NavbarWrapper from '@/app/components/NavbarWrapper';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// ===== HELPER: RENDER RICH TEXT =====
const renderRichText = (content: any) => {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((block: any) => {
        if (block.children && Array.isArray(block.children)) {
          return block.children
            .map((child: any) => child.text || '')
            .join('');
        }
        return '';
      })
      .join(' ');
  }
  if (typeof content === 'object' && content.children) {
    if (Array.isArray(content.children)) {
      return content.children.map((child: any) => child.text || '').join('');
    }
    return content.children.text || '';
  }
  return '';
};

// ===== FETCH HOTEL INFO =====
async function getHotelInfo() {
  try {
    const response = await fetchAPI('/hotel-info');
    return response.data || null;
  } catch (error) {
    console.error('Failed to fetch hotel info:', error);
    return null;
  }
}

// ===== FETCH ABOUT DATA =====
async function getAboutData() {
  try {
    const response = await fetchAPI('/about?populate=image');
    return response.data || null;
  } catch (error) {
    console.error('Failed to fetch about data:', error);
    return null;
  }
}

// ===== FETCH STATS =====
async function getStats() {
  try {
    const response = await fetchAPI('/stats?sort=order');
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return [];
  }
}

// ===== FETCH WHY CHOOSE US =====
async function getWhyChooseUs() {
  try {
    const response = await fetchAPI('/why-choose-uses?sort=order');
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch why choose us:', error);
    return [];
  }
}

// ===== FETCH STAFF =====
async function getStaff() {
  try {
    const response = await fetchAPI('/stafs?populate=image');
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch staff:', error);
    return [];
  }
}

export default async function AboutPage() {
  const hotelInfo = await getHotelInfo();
  const aboutData = await getAboutData();
  const stats = await getStats();
  const whyChooseUs = await getWhyChooseUs();
  const staff = await getStaff();

  // Fallback data
  const statsData = stats.length > 0 ? stats : [
    { documentId: '1', number: '10+', label: 'Years of Service', icon: '🏆' },
    { documentId: '2', number: '25', label: 'Luxury Rooms', icon: '🛏️' },
    { documentId: '3', number: '500+', label: 'Happy Guests', icon: '😊' },
    { documentId: '4', number: '20', label: 'Professional Staff', icon: '👨‍💼' },
  ];

  const whyData = whyChooseUs.length > 0 ? whyChooseUs : [
    { documentId: '1', title: 'Luxury Rooms', description: 'Elegantly designed rooms with modern amenities and stunning views.', icon: '🏨' },
    { documentId: '2', title: '5-Star Service', description: 'Exceptional hospitality with personalized attention to every guest.', icon: '⭐' },
    { documentId: '3', title: 'Prime Location', description: 'Conveniently located near major attractions and cultural sites.', icon: '📍' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <NavbarWrapper hotelName={hotelInfo?.hotelName} />

      {/* ===== HERO SECTION ===== */}
      <section className="relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center z-10">
          <div className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-6 py-2 rounded-full mb-6 border border-white/30">
            ✦ About Us ✦
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {renderRichText(aboutData?.title) || 'Welcome to Rediet Hotel'}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {renderRichText(aboutData?.description) || 'Discover the perfect blend of luxury, comfort, and Ethiopian hospitality in the heart of Shashamane.'}
          </p>
        </div>
      </section>

      {/* ===== ABOUT CONTENT ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                {aboutData?.image?.url ? (
                  <img
                    src={`${STRAPI_URL}${aboutData.image.url}`}
                    alt="Rediet Hotel"
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  />
                ) : (
                  <span className="text-6xl text-gray-400">🏨</span>
                )}
              </div>
            </div>
            <div>
              <div className="inline-block bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                Our Story
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {renderRichText(aboutData?.title) || 'Luxury & Comfort in Every Detail'}
              </h2>
              <div className="text-gray-600 text-lg leading-relaxed mb-6">
                {renderRichText(aboutData?.description) || 'Welcome to Rediet Hotel, where tradition meets modernity. Our story began with a vision to create a sanctuary of comfort and elegance in the heart of Shashamane.'}
              </div>
              {(aboutData?.mission || aboutData?.vision) && (
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {aboutData?.mission && (
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <h4 className="font-bold text-blue-800 text-sm">🎯 Mission</h4>
                      <p className="text-gray-700 text-sm mt-1">{aboutData.mission}</p>
                    </div>
                  )}
                  {aboutData?.vision && (
                    <div className="bg-purple-50 p-4 rounded-xl">
                      <h4 className="font-bold text-purple-800 text-sm">👁️ Vision</h4>
                      <p className="text-gray-700 text-sm mt-1">{aboutData.vision}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
<section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Our Numbers</h2>
      <p className="text-gray-500 mt-2">What makes us proud</p>
      <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-4 rounded-full"></div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {statsData.map((stat: any) => {
        // Convert number to string and check for '+'
        const numberStr = String(stat.number || '');
        const displayNumber = numberStr && !numberStr.includes('+') 
          ? `${numberStr}+` 
          : numberStr;
          
        return (
          <div key={stat.documentId} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="text-4xl mb-3">{stat.icon || '📊'}</div>
            <div className="text-3xl md:text-4xl font-bold text-blue-600">{displayNumber}</div>
            <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
          </div>
        );
      })}
    </div>
  </div>
</section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Why Choose Rediet Hotel</h2>
            <p className="text-gray-500 mt-2">What sets us apart</p>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-4 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyData.map((item: any) => (
              <div key={item.documentId} className="text-center p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition">
                <div className="text-5xl mb-4">{item.icon || '✨'}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      

    </div>
  );
}