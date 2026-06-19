import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // ===== VALIDATION =====
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    // ===== SAVE TO STRAPI =====
    const strapiResponse = await fetch(`${STRAPI_URL}/api/contact-submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          name,
          email,
          phone: phone || '',
          subject,
          message,
          isRead: false,
        },
      }),
    });

    if (!strapiResponse.ok) {
      const errorData = await strapiResponse.json();
      console.error('Strapi error:', errorData);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    const strapiData = await strapiResponse.json();
    console.log('✅ Message saved to Strapi:', strapiData);

    // ===== OPTIONAL: SEND EMAIL (will add later) =====
    // For now, just return success

    return NextResponse.json(
      { 
        message: '✅ Message sent successfully! We\'ll get back to you soon.',
        data: strapiData.data
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}