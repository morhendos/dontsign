import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Simple rate limit storage
type RateLimitStore = Record<string, number[]>;
let rateLimitStore: RateLimitStore = {};

type ErrorResponse = {
  error: string;
  code?: string;
};

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    // Clean up old requests and get valid ones
    const key = `contact:${ip}`;
    const oldRequests = rateLimitStore[key] || [];
    const requests = oldRequests.filter(time => time > hourAgo);
    
    if (requests.length >= 5) {
      const oldestRequest = Math.min(...requests);
      const reset = oldestRequest + (60 * 60 * 1000);
      const retryAfter = Math.ceil((reset - now) / 1000);
      
      return NextResponse.json<ErrorResponse>(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: { 'Retry-After': String(retryAfter) }
        }
      );
    }
    
    // Add current request
    requests.push(now);
    rateLimitStore[key] = requests;

    // Parse request body
    const data = await request.json();
    const { name, email, subject, message } = data;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json<ErrorResponse>(
        { 
          error: 'All fields are required',
          code: 'MISSING_FIELDS'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<ErrorResponse>(
        { 
          error: 'Invalid email format',
          code: 'INVALID_EMAIL'
        },
        { status: 400 }
      );
    }

    // Email sending would go here
    console.log('Contact form processed:', { name, email, subject });

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    
    return NextResponse.json<ErrorResponse>(
      { 
        error: 'An error occurred while processing your request',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}