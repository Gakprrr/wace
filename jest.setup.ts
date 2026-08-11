/**
 * Global Jest setup — runs once before every test file.
 *
 * Rules:
 * - Set env vars required by modules that read them at import time
 * - Do NOT mock heavy modules here — use per-file jest.mock() so
 *   unit tests for auth.service can use real jose/bcrypt
 */

// Required by db.ts (throws if missing at module load)
process.env.DATABASE_URL = "postgresql://fake:fake@localhost:5432/fake_test";
process.env.JWT_SECRET = "test-super-secret-key-at-least-32-chars!!";

// Silence expected Redis/DB connection noise in test output
jest.spyOn(console, "warn").mockImplementation(() => {});

// Mock ioredis globally — no real Redis needed in tests
jest.mock("ioredis", () => {
  const RedisMock = jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    off: jest.fn(),
    subscribe: jest.fn().mockResolvedValue(undefined),
    unsubscribe: jest.fn().mockResolvedValue(undefined),
    publish: jest.fn().mockResolvedValue(1),
    zremrangebyscore: jest.fn().mockResolvedValue(0),
    zcard: jest.fn().mockResolvedValue(0),
    zrange: jest.fn().mockResolvedValue([]),
    zadd: jest.fn().mockResolvedValue(1),
    pexpire: jest.fn().mockResolvedValue(1),
    sadd: jest.fn().mockResolvedValue(1),
    smembers: jest.fn().mockResolvedValue([]),
    srem: jest.fn().mockResolvedValue(1),
    quit: jest.fn().mockResolvedValue("OK"),
  }));
  return RedisMock;
});

// Mock pg Pool — no real Postgres needed
jest.mock("pg", () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  })),
}));

// Mock @prisma/adapter-pg
jest.mock("@prisma/adapter-pg", () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({})),
}));

// Mock PrismaClient — replaced per-test via jest.mock('@/backend/db')
jest.mock("@prisma/client", () => {
  const actual = jest.requireActual("@prisma/client");
  return {
    ...actual,
    PrismaClient: jest.fn().mockImplementation(() => ({})),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});

// Mock LangProvider
jest.mock("@/lib/i18n/LangProvider", () => {
  const { translations } = jest.requireActual("@/lib/i18n/translations");
  return {
    LangProvider: ({ children }: any) => children,
    useLang: () => ({
      locale: "fr",
      t: translations.fr,
      setLocale: jest.fn(),
      toggleLocale: jest.fn(),
    }),
  };
});
