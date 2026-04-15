import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { sanitizeString } from "./security";
import { logger } from "./logger";

// Initialize Redis client for ratelimit
const redis = (process.env.REDIS_URL && process.env.REDIS_TOKEN)
  ? new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN,
  })
  : null;

interface RateLimitOptions {
  windowMs: number;
  max: number;
  key: string;
  identifier?: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

// Rate limit configurations...
export const RATE_LIMIT_CONFIG = {
  AUTH_SIGNIN: { windowMs: 15 * 60 * 1000, max: 5 },
  AUTH_SIGNUP: { windowMs: 60 * 60 * 1000, max: 3 },
  AUTH_FORGOT_PASSWORD: { windowMs: 60 * 60 * 1000, max: 3 },
  AUTH_RESET_PASSWORD: { windowMs: 60 * 60 * 1000, max: 3 },
  API_GENERAL: { windowMs: 60 * 1000, max: 60 },
  API_QUIZ: { windowMs: 60 * 1000, max: 30 },
  API_UPLOAD: { windowMs: 60 * 1000, max: 10 },
  AI_GENERATE: { windowMs: 60 * 60 * 1000, max: 10 },
  AI_CHAT: { windowMs: 60 * 1000, max: 10 },
  PUBLIC: { windowMs: 60 * 1000, max: 100 },
  SEARCH: { windowMs: 60 * 1000, max: 30 },
  PAYMENT: { windowMs: 60 * 60 * 1000, max: 5 },
};

/**
 * Modernized rate limiter using Upstash Redis 
 */
export async function rateLimit(
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const { windowMs, max, key, identifier } = options;
  const sanitizedKey = sanitizeString(key, 200);

  // If Redis is not available, fail-open with a warning
  if (!redis) {
    logger.warn("Redis not configured, rate limiting skipped", { key: sanitizedKey });
    return {
      allowed: true,
      remaining: max,
      resetTime: new Date(Date.now() + windowMs),
    };
  }

  try {
    const ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(max, `${Math.floor(windowMs / 1000)}s`),
      analytics: true,
      prefix: "@upstash/ratelimit",
    });

    const { success, limit, remaining, reset } = await ratelimit.limit(sanitizedKey);

    if (!success) {
      logger.warn(`Rate limit exceeded for ${identifier || sanitizedKey}`, {
        key: sanitizedKey.substring(0, 20),
        reset: new Date(reset).toISOString(),
      });
    }

    return {
      allowed: success,
      remaining,
      resetTime: new Date(reset),
      retryAfter: Math.ceil((reset - Date.now()) / 1000),
    };
  } catch (error) {
    logger.error("Rate limit check failed", error as Error, { key, identifier });
    // Fail-open strategy
    return {
      allowed: true,
      remaining: max,
      resetTime: new Date(Date.now() + windowMs),
    };
  }
}

/**
 * Create rate limit key from request
 */
export function generateRateLimitKey(
  req: any,
  prefix: string = "global",
): string {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return `${prefix}:${ip}`;
}

/**
 * Create rate limit key from user ID
 */
export function generateUserRateLimitKey(
  userId: string,
  prefix: string = "user",
): string {
  return `${prefix}:${userId}`;
}

/**
 * Get rate limit config by category
 */
export function getRateLimitConfig(category: keyof typeof RATE_LIMIT_CONFIG) {
  return RATE_LIMIT_CONFIG[category] || RATE_LIMIT_CONFIG.API_GENERAL;
}

/**
 * In-memory rate limiter for high-frequency checks (fallback)
 */
class InMemoryRateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        const now = Date.now();
        for (const [key, value] of this.store.entries()) {
          if (now > value.resetTime) {
            this.store.delete(key);
          }
        }
      },
      5 * 60 * 1000,
    );
  }

  check(key: string, max: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return {
        allowed: true,
        remaining: max - 1,
        resetTime: new Date(now + windowMs),
      };
    }

    if (entry.count >= max) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(entry.resetTime),
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: max - entry.count,
      resetTime: new Date(entry.resetTime),
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Global in-memory rate limiter instance
export const inMemoryRateLimiter = new InMemoryRateLimiter();

/**
 * Apply rate limiting to a request
 * Returns { allowed: boolean, result: RateLimitResult }
 */
export async function applyRateLimit(
  category: keyof typeof RATE_LIMIT_CONFIG,
  key: string,
  identifier?: string,
): Promise<{ allowed: boolean; result: RateLimitResult }> {
  const config = getRateLimitConfig(category);
  const result = await rateLimit({
    ...config,
    key,
    identifier,
  });

  return {
    allowed: result.allowed,
    result,
  };
}

/**
 * Get rate limit status for a key
 */
export async function getRateLimitStatus(key: string): Promise<{
  requestCount: number;
  resetTime: Date | null;
} | null> {
  try {
    const db = await getDatabase();
    const rateLimitCollection = db.collection("rateLimits");
    const now = new Date();

    // Find all non-expired entries for this key
    const entries = await rateLimitCollection
      .find({
        key: sanitizeString(key, 200),
        expiresAt: { $gt: now },
      })
      .toArray();

    if (entries.length === 0) {
      return null;
    }

    // Find the earliest reset time
    const resetTime = entries.reduce((earliest: Date, entry: any) => {
      return entry.expiresAt < earliest ? entry.expiresAt : earliest;
    }, entries[0].expiresAt);

    return {
      requestCount: entries.length,
      resetTime,
    };
  } catch (error) {
    logger.error("Failed to get rate limit status", error as Error);
    return null;
  }
}

/**
 * Reset rate limit for a key
 */
export async function resetRateLimit(key: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    const rateLimitCollection = db.collection("rateLimits");

    const result = await rateLimitCollection.deleteMany({
      key: sanitizeString(key, 200),
    });

    logger.info("Rate limit reset", {
      key: key.substring(0, 20),
      deletedCount: result.deletedCount,
    });

    return result.deletedCount > 0;
  } catch (error) {
    logger.error("Failed to reset rate limit", error as Error);
    return false;
  }
}

/**
 * Whitelist a key from rate limiting
 */
const whitelist = new Set<string>();

export function addToRateLimitWhitelist(key: string) {
  whitelist.add(key);
}

export function removeFromRateLimitWhitelist(key: string) {
  whitelist.delete(key);
}

export function isRateLimitWhitelisted(key: string): boolean {
  return whitelist.has(key);
}

export function clearRateLimitWhitelist() {
  whitelist.clear();
}
