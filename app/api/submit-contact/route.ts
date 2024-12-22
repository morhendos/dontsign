import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Simple in-memory store for rate limiting
// Key: IP address, Value: Array of timestamps
const rateLimit = new Map<string, number[]>();

// Rate limit config
const LIMIT = 5; // requests
const WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

export async function POST(request: NextRequest) {
  try {
    // Get IP address
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
    
    // Check rate limit
    const now = Date.now();
    const windowStart = now - WINDOW;
    
    // Get and clean old requests
    const requests = (rateLimit.get(ip) || []).filter(time => time > windowStart);
    
    if (requests.length >= LIMIT) {
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
    
    // Add current request
    requests.push(now);
    rateLimit.set(ip, requests);

    // Process the request
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

    console.log('Contact form processed:', { name, email, subject });

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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}