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

// ===== CREATE BOOKING WITH PAYMENT SCREENSHOT =====
export async function createBookingWithImage(formData: FormData) {
  console.log('📤 createBookingWithImage called');
  
  try {
    // Step 1: Extract data from FormData
    const dataString = formData.get('data') as string;
    const file = formData.get('files.paymentScreenshot') as File;
    
    if (!dataString) {
      throw new Error('No data found in FormData');
    }
    
    const bookingData = JSON.parse(dataString);
    console.log('📤 Booking data:', bookingData);
    
    // Step 1: Create booking first
    const bookingResult = await createBooking(bookingData);
    console.log('✅ Booking created. ID:', bookingResult.data?.id);
    
    // Step 2: Upload image if exists
    if (file && file.size > 0 && bookingResult.data?.id) {
      console.log('📤 Uploading image...');
      
      // ✅ APPROACH 1: Upload to media library first
      const uploadFormData = new FormData();
      uploadFormData.append('files', file);
      
      const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        body: uploadFormData,
      });
      
      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error('❌ Upload failed:', uploadRes.status, errorText);
        return bookingResult;
      }
      
      const uploadData = await uploadRes.json();
      console.log('✅ Image uploaded to media library:', uploadData);
      
      // Step 3: Link the image to the booking
      if (uploadData && uploadData[0]?.id) {
        const imageId = uploadData[0].id;
        console.log('📤 Linking image (ID:', imageId, ') to booking');
        
        // ✅ Update the booking with the image ID
        const updateRes = await fetch(`${STRAPI_URL}/api/bookings/${bookingResult.data.documentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              paymentScreenshot: imageId,
            },
          }),
        });
        
        if (updateRes.ok) {
          const updateData = await updateRes.json();
          console.log('✅ Image linked to booking successfully:', updateData);
          return {
            ...bookingResult,
            imageUploaded: true,
          };
        } else {
          const errorText = await updateRes.text();
          console.error('❌ Failed to link image:', updateRes.status, errorText);
        }
      }
    }
    
    return bookingResult;
    
  } catch (error) {
    console.error('❌ createBookingWithImage error:', error);
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