import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Custom error type for better error handling
class ContactFormError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'ContactFormError';
  }
}

// Simple cache-based rate limiting
async function checkRateLimit(key: string): Promise<{ success: boolean; reset?: number }> {
  try {
    const now = Date.now();
    const cache = await caches.open('rate-limit');
    const response = await cache.match(key);
    
    if (!response) {
      // First request
      await cache.put(
        key,
        new Response(JSON.stringify({ requests: [now] }), {
          headers: { 'Content-Type': 'application/json' }
        })
      );
      return { success: true };
    }

    const data = await response.json();
    const hourAgo = now - (60 * 60 * 1000);
    const recentRequests = data.requests.filter((time: number) => time > hourAgo);

    if (recentRequests.length >= 5) {
      const oldestRequest = Math.min(...recentRequests);
      const reset = oldestRequest + (60 * 60 * 1000);
      return { success: false, reset };
    }

    // Add current request
    recentRequests.push(now);
    await cache.put(
      key,
      new Response(JSON.stringify({ requests: recentRequests }), {
        headers: { 'Content-Type': 'application/json' }
      })
    );

    return { success: true };
  } catch (error) {
    // On error, allow the request but log it
    console.error('Rate limit error:', error);
    return { success: true };
  }
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
    const { success, reset } = await checkRateLimit(`contact:${ip}`);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: reset ? {
            'Retry-After': String(Math.ceil((reset - Date.now()) / 1000))
          } : undefined
        }
      );
    }

    // Parse and validate request body
    let data;
    try {
      data = await request.json();
    } catch {
      throw new ContactFormError(
        'Invalid request body',
        'INVALID_JSON',
        400
      );
    }

    const { name, email, subject, message } = data;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      throw new ContactFormError(
        'All fields are required',
        'MISSING_FIELDS',
        400
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ContactFormError(
        'Invalid email format',
        'INVALID_EMAIL',
        400
      );
    }

    // Email sending would go here
    console.log('Contact form processed:', { name, email, subject });

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    // Determine error details
    const status = error instanceof ContactFormError ? error.status : 500;
    const code = error instanceof ContactFormError ? error.code : 'UNKNOWN';
    const message = error instanceof Error ? 
      error.message : 
      'An error occurred while processing your request';

    console.error('Contact form error:', { 
      code,
      message,
      error
    });

    return NextResponse.json(
      { 
        error: message,
        code 
      },
      { status }
    );
  }
}