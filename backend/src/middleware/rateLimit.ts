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
 * Middleware helper: returns a 429 Response if rate-limited, or null if OK.
 */
export async function withRateLimit(
  request: Request,
  identifier: string,
  maxRequests = 10,
  windowSec = 60
): Promise<Response | null> {
  const result = await checkRateLimit(identifier, maxRequests, windowSec);

  if (!result.success) {
    return new Response(JSON.stringify({ error: "Too Many Requests" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.reset),
        "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
      },
    });
  }

  return null;
}
