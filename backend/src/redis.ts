import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisOptions = {
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy(times: number) {
    if (times > 3) {
      return null; // Stopper les tentatives de reconnexion après 3 essais en dev
    }
    return Math.min(times * 100, 2000);
  },
};

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
  redisSub: Redis | undefined;
};

// ── Main client (pub/commands) ────────────────────────────────────────────────

let redisClient: Redis;

if (process.env.NODE_ENV === "production") {
  redisClient = new Redis(redisUrl, redisOptions);
} else {
  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(redisUrl, redisOptions);
  }
  redisClient = globalForRedis.redis;
}

let loggedError = false;
redisClient.on("error", (err) => {
  if (!loggedError) {
    console.warn("⚠️ Redis hors-ligne (Le rate-limiting et les notifications SSE tourneront sans Redis) :", err.message);
    loggedError = true;
  }
});

export const redis = redisClient;

// ── Shared SSE subscriber (one connection for all SSE clients) ────────────────

let redisSubClient: Redis;

if (process.env.NODE_ENV === "production") {
  redisSubClient = new Redis(redisUrl, redisOptions);
} else {
  if (!globalForRedis.redisSub) {
    globalForRedis.redisSub = new Redis(redisUrl, redisOptions);
  }
  redisSubClient = globalForRedis.redisSub;
}

redisSubClient.on("error", () => {});

export const redisSub = redisSubClient;
