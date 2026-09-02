import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
  redisSub: Redis | undefined;
};

// ── Main client (pub/commands) ────────────────────────────────────────────────

let redisClient: Redis;

if (process.env.NODE_ENV === "production") {
  redisClient = new Redis(redisUrl, { maxRetriesPerRequest: 3 });
} else {
  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(redisUrl, { maxRetriesPerRequest: 3 });
  }
  redisClient = globalForRedis.redis;
}

redisClient.on("error", (err) => {
  console.warn("Redis client error (check if Docker/Redis is running):", err.message);
});

export const redis = redisClient;

// ── Shared SSE subscriber (one connection for all SSE clients) ────────────────
// A Redis connection in subscribe mode cannot issue regular commands.
// Re-using one subscriber for all SSE streams avoids opening N connections.

let redisSubClient: Redis;

if (process.env.NODE_ENV === "production") {
  redisSubClient = new Redis(redisUrl, { maxRetriesPerRequest: 3 });
} else {
  if (!globalForRedis.redisSub) {
    globalForRedis.redisSub = new Redis(redisUrl, { maxRetriesPerRequest: 3 });
  }
  redisSubClient = globalForRedis.redisSub;
}

redisSubClient.on("error", (err) => {
  console.warn("Redis subscriber error:", err.message);
});

export const redisSub = redisSubClient;
