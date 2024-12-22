import { Redis } from '@upstash/redis'

const CHUNK_WINDOW_SECONDS = 5; // Time window for chunk processing rate limit
const MAX_CHUNKS_PER_WINDOW = 2; // Maximum chunks that can be processed in the window

const redis = Redis.fromEnv();

export async function canProcessChunk(userId: string): Promise<boolean> {
  const key = `chunk_rate:${userId}`;
  const now = Date.now();
  const windowStart = now - (CHUNK_WINDOW_SECONDS * 1000);

  // Remove old entries
  await redis.zremrangebyscore(key, 0, windowStart);

  // Count recent chunks
  const recentChunks = await redis.zcount(key, windowStart, now);

  if (recentChunks >= MAX_CHUNKS_PER_WINDOW) {
    return false;
  }

  // Add new chunk timestamp
  await redis.zadd(key, { score: now, member: now.toString() });
  await redis.expire(key, CHUNK_WINDOW_SECONDS * 2);

  return true;
}

export async function waitForChunkProcessing(userId: string): Promise<void> {
  while (!(await canProcessChunk(userId))) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}