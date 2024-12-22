import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Enable edge runtime

type RateLimitResponse = { success: boolean; reset?: number };

async function rateLimit(ip: string): Promise<RateLimitResponse> {
  // Define limits
  const maxRequests = 5;
  const windowSize = 60 * 60; // 1 hour in seconds
  
  try {
    // Get the cache key for this IP
    const cacheKey = `ratelimit:${ip}`;
    
    // Get current timestamp in seconds
    const now = Math.floor(Date.now() / 1000);
    
    // Create cache if it doesn't exist
    const res = await fetch(`https://api.vercel.com/v1/edge-config/${cacheKey}`, {
      method: 'POST',
      headers: {
        'Cache-Control': 'no-store', // Important for real-time rate limiting
      },
    });

    const data = await res.json();
    const timestamps: number[] = data.timestamps || [];
    
    // Filter timestamps within current window
    const windowStart = now - windowSize;
    const windowTimestamps = timestamps.filter(ts => ts > windowStart);
    
    // Check if rate limit exceeded
    if (windowTimestamps.length >= maxRequests) {
      // Return time until oldest timestamp expires
      const oldestTimestamp = Math.min(...windowTimestamps);
      const reset = oldestTimestamp + windowSize;
      return { success: false, reset };
    }
    
    // Add current timestamp
    windowTimestamps.push(now);
    
    // Store updated timestamps
    await fetch(`https://api.vercel.com/v1/edge-config/${cacheKey}`, {
      method: 'PUT',
      body: JSON.stringify({ timestamps: windowTimestamps }),
      headers: {
        'Cache-Control': 'no-store',
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error('Rate limit error:', error);
    // On error, allow the request (fail open)
    return { success: true };
  }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
    
    // Check rate limit
    const { success, reset } = await rateLimit(ip);
    
    if (!success) {
      return NextResponse.json(
        { 
          error: 'Too many requests. Please try again later.',
          reset
        },
        { 
          status: 429,
          headers: reset ? {
            'Retry-After': String(reset)
          } : undefined
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
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending your message' },
      { status: 500 }
    );
  }
}
