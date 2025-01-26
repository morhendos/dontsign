import { type NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/services/email';

export const runtime = 'nodejs';

const rateLimit = new Map<string, number[]>();
const LIMIT = 5;
const WINDOW = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  console.log('Contact form submission received');
  
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
    const now = Date.now();
    const windowStart = now - WINDOW;
    const requests = (rateLimit.get(ip) || []).filter(time => time > windowStart);
    
    if (requests.length >= LIMIT) {
      console.log('Rate limit exceeded for IP:', ip);
      const oldestRequest = Math.min(...requests);
      const resetTime = oldestRequest + WINDOW;
      const retryAfter = Math.ceil((resetTime - now) / 1000);
      
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(LIMIT),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000))
          }
        }
      );
    }
    
    requests.push(now);
    rateLimit.set(ip, requests);

    const data = await request.json();
    console.log('Processing contact form data:', data);

    const { name, email, subject, message } = data;

    if (!name || !email || !subject || !message) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const emailResult = await sendContactEmail({ name, email, subject, message });
    console.log('Email sending result:', emailResult);
    
    if (!emailResult.success) {
      throw new Error(emailResult.error);
    }

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { 
        status: 200,
        headers: {
          'X-RateLimit-Limit': String(LIMIT),
          'X-RateLimit-Remaining': String(LIMIT - requests.length),
          'X-RateLimit-Reset': String(Math.ceil((now + WINDOW) / 1000))
        }
      }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}