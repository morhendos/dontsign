import { Redis } from '@upstash/redis'
import { NextRequest } from 'next/server'

export interface RateLimitConfig {
  /** Number of requests allowed within the window */
  maxRequests: number;
  /** Time window in seconds */
  windowInSeconds: number;
}

export class RateLimiter {
  private redis: Redis;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.redis = Redis.fromEnv();
    this.config = config;
  }

  private getKey(identifier: string): string {
    return `rate_limit:${identifier}`;
  }

  async isRateLimited(req: NextRequest): Promise<{
    limited: boolean;
    remaining: number;
    reset: number;
  }> {
    const identifier = req.ip || 'anonymous';
    const key = this.getKey(identifier);
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - this.config.windowInSeconds;

    // Get current requests in window
    const requests = await this.redis.zcount(key, windowStart, now);
    
    // Clean up old entries
    await this.redis.zremrangebyscore(key, 0, windowStart);

    if (requests >= this.config.maxRequests) {
      const oldestTimestamp = await this.redis.zrange(key, 0, 0, { withScores: true });
      const reset = oldestTimestamp ? Math.ceil(Number(oldestTimestamp[0].score) + this.config.windowInSeconds) : now + this.config.windowInSeconds;
      
      return {
        limited: true,
        remaining: 0,
        reset
      };
    }

    // Add new request
    await this.redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    // Set expiry on the key
    await this.redis.expire(key, this.config.windowInSeconds * 2);

    return {
      limited: false,
      remaining: this.config.maxRequests - requests - 1,
      reset: now + this.config.windowInSeconds
    };
  }
}

// Default configuration
export const defaultRateLimitConfig: RateLimitConfig = {
  maxRequests: 10,
  windowInSeconds: 60 // 10 requests per minute
};