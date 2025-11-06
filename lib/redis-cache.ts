import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

function getRedis() {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

export async function getCached<T>(key: string, ttlSeconds = 300): Promise<T | null> {
  try {
    const r = getRedis();
    if (!r) return null;
    const val = await r.get<T>(key);
    return val;
  } catch (e) {
    console.warn('Redis get error:', e);
    return null;
  }
}

export async function setCached(key: string, value: any, ttlSeconds = 300) {
  try {
    const r = getRedis();
    if (!r) return;
    await r.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (e) {
    console.warn('Redis set error:', e);
  }
}

export async function invalidateCache(pattern: string) {
  try {
    const r = getRedis();
    if (!r) return;
    const keys = await r.keys(pattern);
    if (keys.length) await r.del(...keys);
  } catch (e) {
    console.warn('Redis invalidate error:', e);
  }
}

