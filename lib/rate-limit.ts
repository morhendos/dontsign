import * as Sentry from '@sentry/nextjs';

type RateLimitResult = {
  success: boolean;
  reset: number;
  remaining: number;
  error?: {
    code: string;
    message: string;
  };
};

export type RateLimitConfig = {
  uniqueKey: string;
  limit: number;
  timeWindow: number; // in seconds
  errorFallback?: 'allow' | 'deny'; // what to do on errors
};

// Error types for better error handling
class RateLimitError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Rate limit implementation using Edge Runtime's Cache API
 * Falls back to allowing requests if cache is unavailable
 */
export async function rateLimit({
  uniqueKey,
  limit,
  timeWindow,
  errorFallback = 'allow'
}: RateLimitConfig): Promise<RateLimitResult> {
  try {
    // Input validation
    if (!uniqueKey) throw new RateLimitError('Invalid key', 'INVALID_KEY', 500);
    if (limit < 1) throw new RateLimitError('Invalid limit', 'INVALID_LIMIT', 500);
    if (timeWindow < 1) throw new RateLimitError('Invalid time window', 'INVALID_WINDOW', 500);

    // Cache availability check
    if (typeof caches === 'undefined') {
      throw new RateLimitError('Cache API not available', 'NO_CACHE', 500);
    }

    const now = Math.floor(Date.now() / 1000);
    const timestamps = await getTimestamps(uniqueKey);
    const windowStart = now - timeWindow;

    // Clean up old timestamps
    const validRequests = timestamps.filter(ts => ts > windowStart);

    // Check limit
    if (validRequests.length >= limit) {
      const oldestTimestamp = Math.min(...validRequests);
      const reset = oldestTimestamp + timeWindow;

      return {
        success: false,
        reset,
        remaining: 0
      };
    }

    // Add current request
    validRequests.push(now);
    await setTimestamps(uniqueKey, validRequests);

    return {
      success: true,
      reset: now + timeWindow,
      remaining: limit - validRequests.length
    };

  } catch (error) {
    // Log to Sentry with contextual info
    Sentry.captureException(error, {
      tags: {
        rate_limit_key: uniqueKey,
        error_fallback: errorFallback
      },
      extra: {
        limit,
        timeWindow
      }
    });

    // Decide what to do on error based on configuration
    return {
      success: errorFallback === 'allow',
      reset: Math.floor(Date.now() / 1000) + timeWindow,
      remaining: errorFallback === 'allow' ? limit - 1 : 0,
      error: {
        code: error instanceof RateLimitError ? error.code : 'UNKNOWN',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

async function getTimestamps(key: string): Promise<number[]> {
  try {
    const cache = await caches.open('rate-limit');
    const response = await cache.match(key);

    if (!response) return [];

    const data = await response.json();
    return Array.isArray(data.timestamps) ? data.timestamps : [];
  } catch (error) {
    // Log cache read errors to Sentry
    Sentry.captureException(error, {
      tags: {
        operation: 'cache_read',
        key
      }
    });
    throw new RateLimitError(
      'Failed to read from cache',
      'CACHE_READ_ERROR',
      500
    );
  }
}

async function setTimestamps(key: string, timestamps: number[]): Promise<void> {
  try {
    const cache = await caches.open('rate-limit');
    await cache.put(
      key,
      new Response(JSON.stringify({ timestamps }), {
        headers: {
          'Content-Type': 'application/json',
          // Add cache control headers
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          'Expires': '0',
          'Pragma': 'no-cache'
        }
      })
    );
  } catch (error) {
    // Log cache write errors to Sentry
    Sentry.captureException(error, {
      tags: {
        operation: 'cache_write',
        key
      },
      extra: {
        timestamps
      }
    });
    throw new RateLimitError(
      'Failed to write to cache',
      'CACHE_WRITE_ERROR',
      500
    );
  }
}