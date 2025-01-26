import { NextRequest, NextResponse } from 'next/server';

type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

const rateLimit = new Map<string, number[]>();

export function createRateLimiter(config: RateLimitConfig) {
  return async function rateLimitMiddleware(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    const requests = (rateLimit.get(ip) || []).filter(time => time > windowStart);
    
    if (requests.length >= config.limit) {
      const oldestRequest = Math.min(...requests);
      const resetTime = oldestRequest + config.windowMs;
      const retryAfter = Math.ceil((resetTime - now) / 1000);
      
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(config.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000))
          }
        }
      );
    }
    
    requests.push(now);
    rateLimit.set(ip, requests);

    return null;
  };
}