type RateLimitProps = {
  uniqueKey: string;
  limit: number;
  timeWindow: number; // in seconds
};

export async function rateLimit({ uniqueKey, limit, timeWindow }: RateLimitProps) {
  const timestamps = await getTimestamps(uniqueKey);
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - timeWindow;
  
  // Remove old timestamps
  const validRequests = timestamps.filter(timestamp => timestamp > windowStart);
  
  if (validRequests.length >= limit) {
    // Calculate reset time
    const oldestTimestamp = Math.min(...validRequests);
    const reset = oldestTimestamp + timeWindow;
    return { 
      success: false, 
      reset,
      remaining: 0
    };
  }
  
  // Add current timestamp
  validRequests.push(now);
  await setTimestamps(uniqueKey, validRequests);
  
  return { 
    success: true,
    reset: now + timeWindow,
    remaining: limit - validRequests.length
  };
}

async function getTimestamps(key: string): Promise<number[]> {
  if (typeof caches === 'undefined') return [];
  
  try {
    const cache = await caches.open('rate-limit');
    const response = await cache.match(key);
    
    if (!response) return [];
    
    const data = await response.json();
    return data.timestamps || [];
  } catch {
    return [];
  }
}

async function setTimestamps(key: string, timestamps: number[]) {
  if (typeof caches === 'undefined') return;
  
  try {
    const cache = await caches.open('rate-limit');
    await cache.put(
      key,
      new Response(JSON.stringify({ timestamps }), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
  } catch {}
}