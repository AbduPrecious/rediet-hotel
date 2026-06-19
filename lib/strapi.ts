// frontend/lib/strapi.ts
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith('/') 
    ? `${STRAPI_URL}/api${endpoint}` 
    : `${STRAPI_URL}/api/${endpoint}`;
  
  console.log('🔍 Fetching:', url);
  
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ API Error:', res.status, errorText);
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Get all rooms with images
export async function getRooms() {
  try {
    const data = await fetchAPI('/rooms?populate=images');
    return data.data || [];
  } catch (error) {
    console.error('❌ Failed to fetch rooms:', error);
    return [];
  }
}

// Get single room with images
export async function getRoomBySlug(slug: string) {
  try {
    console.log('🔍 Fetching room with slug:', slug);
    const data = await fetchAPI(`/rooms?filters[slug][$eq]=${slug}&populate=images`);
    console.log('📦 Response data:', data);
    
    if (data && data.data && data.data.length > 0) {
      return data.data[0];
    }
    console.log('❌ No room found with slug:', slug);
    return null;
  } catch (error) {
    console.error('❌ Error fetching room:', error);
    return null;
  }
}

// Create a booking
export async function createBooking(bookingData: any) {
  console.log('📤 createBooking called with:', JSON.stringify(bookingData, null, 2));
  
  try {
    const data = await fetchAPI('/bookings', {
      method: 'POST',
      body: JSON.stringify({ data: bookingData }),
    });
    console.log('✅ createBooking response:', data);
    return data;
  } catch (error) {
    console.error('❌ createBooking error:', error);
    throw error;
  }
}

// ===== FETCH HOTEL INFO (SINGLE TYPE) =====
export async function getHotelInfo() {
  try {
    const data = await fetchAPI('/hotel-info?populate=heroImage');
    console.log('🏨 Hotel Info:', data.data);
    return data.data || null;
  } catch (error) {
    console.error('❌ Failed to fetch hotel info:', error);
    return null;
  }
}