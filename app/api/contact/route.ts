import { NextResponse } from 'next/server';

export const runtime = 'edge';
const rateLimitData = new Map<string, number[]>();

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

async function checkRateLimit(key: string): Promise<{ success: boolean; reset?: number }> {
  const now = Date.now();
  const hourAgo = now - (60 * 60 * 1000);
  
  // Get and clean old requests
  const requests = (rateLimitData.get(key) || []).filter(time => time > hourAgo);
  
  if (requests.length >= 5) {
    const oldestRequest = Math.min(...requests);
    const reset = oldestRequest + (60 * 60 * 1000);
    return { success: false, reset };
  }
  
  // Add current request
  requests.push(now);
  rateLimitData.set(key, requests);
  
  return { success: true };
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

    // Parse request body
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
    // Handle errors
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