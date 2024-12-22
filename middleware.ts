import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { RateLimiter, defaultRateLimitConfig } from './lib/rate-limit'

const rateLimiter = new RateLimiter(defaultRateLimitConfig);

export async function middleware(request: NextRequest) {
  // Only apply rate limiting to the analyze API endpoint
  if (request.nextUrl.pathname === '/api/analyze') {
    const rateLimitResult = await rateLimiter.isRateLimited(request);

    // Add rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', defaultRateLimitConfig.maxRequests.toString());
    headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString());

    if (rateLimitResult.limited) {
      return new NextResponse(JSON.stringify({
        error: 'Too many requests',
        retryAfter: rateLimitResult.reset - Math.floor(Date.now() / 1000)
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': rateLimitResult.reset.toString(),
          ...Object.fromEntries(headers)
        }
      });
    }

    // Continue with the request but include rate limit headers
    const response = NextResponse.next();
    headers.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
}