import { getDatabase } from './mongodb';

// MongoDB-based caching (free, unlimited within your MongoDB tier)
export async function getCached<T>(key: string, ttlSeconds = 300): Promise<T | null> {
  try {
    const db = await getDatabase();
    const cache = db.collection('cache');
    
    const doc: any = await cache.findOne({ 
      key,
      expiresAt: { $gt: new Date() }
    });
    
    if (!doc) return null;
    return doc.value as T;
  } catch (e) {
    console.warn('Cache get error:', e);
    return null;
  }
}

export async function setCached(key: string, value: any, ttlSeconds = 300) {
  try {
    const db = await getDatabase();
    const cache = db.collection('cache');
    
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    
    await cache.updateOne(
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
    
    // Create TTL index if it doesn't exist (auto-delete expired entries)
    try {
      await cache.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    } catch {
      // Index might already exist, ignore
    }
  } catch (e) {
    console.warn('Cache set error:', e);
  }
}

export async function invalidateCache(pattern: string) {
  try {
    const db = await getDatabase();
    const cache = db.collection('cache');
    
    // MongoDB regex pattern matching
    const regex = new RegExp(pattern.replace('*', '.*'));
    await cache.deleteMany({ key: { $regex: regex } });
  } catch (e) {
    console.warn('Cache invalidate error:', e);
  }
}

