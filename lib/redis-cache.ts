import { Redis } from '@upstash/redis';
import { getDatabase } from './mongodb';

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  : null;

/**
 * High-performance caching using Upstash Redis with MongoDB fallback.
 */
export async function getCached<T>(key: string, ttlSeconds = 300): Promise<T | null> {
  try {
    if (redis) {
      const data = await redis.get<T>(key);
      if (data) return data;
    }

    // Fallback to MongoDB
    const db = await getDatabase();
    const doc: any = await db.collection('cache').findOne({
      key,
      expiresAt: { $gt: new Date() }
    });

    return doc ? (doc.value as T) : null;
  } catch (e) {
    console.warn('Cache get error:', e);
    return null;
  }
}

export async function setCached(key: string, value: any, ttlSeconds = 300) {
  try {
    if (redis) {
      await redis.set(key, value, { ex: ttlSeconds });
    }

    // Always store in MongoDB as a persistent secondary cache/fallback
    const db = await getDatabase();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await db.collection('cache').updateOne(
      { key },
      {
        $set: {
          key,
          value,
          expiresAt,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
  } catch (e) {
    console.warn('Cache set error:', e);
  }
}

export async function invalidateCache(pattern: string) {
  try {
    if (redis) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }

    const db = await getDatabase();
    const regex = new RegExp(pattern.replace('*', '.*'));
    await db.collection('cache').deleteMany({ key: { $regex: regex } });
  } catch (e) {
    console.warn('Cache invalidate error:', e);
  }
}
