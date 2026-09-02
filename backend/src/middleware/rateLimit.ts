import { Request, Response, NextFunction } from "express";
import { redis } from "@/redis";

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Sliding-window rate limiter backed by Redis.
 * @param identifier  Unique key (e.g. IP address, userId)
 * @param maxRequests Maximum requests allowed in the window
 * @param windowSec   Window size in seconds
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests = 10,
  windowSec = 60
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowMs = windowSec * 1000;

  try {
    // Remove expired entries
    await redis.zremrangebyscore(key, 0, now - windowMs);

    // Count current entries in window
    const count = await redis.zcard(key);

    if (count >= maxRequests) {
      const oldestEntry = await redis.zrange(key, 0, 0, "WITHSCORES");
      const resetTime = oldestEntry.length >= 2 ? parseInt(oldestEntry[1]) + windowMs : now + windowMs;

      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: resetTime,
      };
    }

    // Add current request
    await redis.zadd(key, now, `${now}-${Math.random()}`);
    await redis.pexpire(key, windowMs);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - count - 1,
      reset: now + windowMs,
    };
  } catch (error) {
    // If Redis is unavailable, allow the request (fail-open)
    console.warn("Rate limiting failed (Redis unavailable), allowing request:", error);
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests,
      reset: now + windowMs,
    };
  }
}

/**
 * Express middleware for Rate Limiting
 */
export function expressRateLimit(maxRequests = 10, windowSec = 60) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";
    const identifier = `${req.path}:${ip}`;

    const result = await checkRateLimit(identifier, maxRequests, windowSec);

    res.setHeader("X-RateLimit-Limit", String(result.limit));
    res.setHeader("X-RateLimit-Remaining", String(result.remaining));
    res.setHeader("X-RateLimit-Reset", String(result.reset));

    if (!result.success) {
      res.setHeader("Retry-After", String(Math.ceil((result.reset - Date.now()) / 1000)));
      res.status(429).json({ error: "Trop de requêtes, veuillez réessayer dans quelques instants." });
      return;
    }

    next();
  };
}
