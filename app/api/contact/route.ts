import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    // Rate limit: 5 requests per hour per IP
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
    const { success, reset, remaining } = await rateLimit({
      uniqueKey: `contact:${ip}`,
      limit: 5,
      timeWindow: 3600 // 1 hour in seconds
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(reset),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': String(remaining),
            'X-RateLimit-Reset': String(reset)
          }
        }
      );
    }

    const data = await request.json();
    const { name, email, subject, message } = data;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Here you would typically send the email using your preferred service
    // For example, using SendGrid, AWS SES, or other email service
    console.log('Contact form submission:', { name, email, subject, message });

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { 
        status: 200,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset)
        }
      }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending your message' },
      { status: 500 }
    );
  }
}