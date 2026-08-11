import { describe, it, expect, vi } from 'vitest';
/**
 * API Route tests — /api/notifications/subscribe (SSE)
 *
 * NOTE: subscribedChannels is a module-level Set that persists between tests.
 * The SSE route only calls redisSub.subscribe() for NEW channels.
 * We use vi.resetModules() to get a fresh module state per test group.
 */
import { Role } from "@prisma/client";
import { generateToken } from "@/backend/services/auth.service";

vi.mock("@/backend/db", () => ({ db: {} }));

const mockRedisSub = {
  on: vi.fn(),
  off: vi.fn(),
  subscribe: vi.fn().mockResolvedValue(undefined),
};
vi.mock("@/backend/redis", () => ({
  redis: { on: vi.fn() },
  redisSub: mockRedisSub,
}));

function makeSSERequest(token?: string): Request {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return new Request("http://localhost/api/notifications/subscribe", {
    method: "GET",
    headers,
    signal: new AbortController().signal,
  });
}

// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/notifications/subscribe (SSE)", () => {
  it("returns a text/event-stream response with correct headers", async () => {
    vi.resetModules();
    const { GET: sseHandler } = await import("@/app/api/notifications/subscribe/route");
    const res = await sseHandler(makeSSERequest());
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");
    expect(res.headers.get("cache-control")).toContain("no-cache");
    expect(res.headers.get("connection")).toBe("keep-alive");
  });

  it("subscribes to notifications:all channel for anonymous (fresh module)", async () => {
    // Reset module to clear the subscribedChannels Set
    vi.resetModules();
    mockRedisSub.subscribe.mockClear();
    const { GET: sseHandler } = await import("@/app/api/notifications/subscribe/route");

    await sseHandler(makeSSERequest());
    expect(mockRedisSub.subscribe).toHaveBeenCalledWith("notifications:all");
  });

  it("subscribes to user-specific channel when authenticated (fresh module)", async () => {
    vi.resetModules();
    mockRedisSub.subscribe.mockClear();
    const { GET: sseHandler } = await import("@/app/api/notifications/subscribe/route");

    const token = await generateToken({ userId: "u42", email: "u@u.com", role: Role.CLIENT });
    await sseHandler(makeSSERequest(token));

    const subscribedChannels = mockRedisSub.subscribe.mock.calls.map((c: string[]) => c[0]);
    expect(subscribedChannels).toContain("notifications:all");
    expect(subscribedChannels).toContain("notifications:user:u42");
  });

  it("does not re-subscribe to already-subscribed channels", async () => {
    // Use same module instance (not reset) — channels are already in the Set
    mockRedisSub.subscribe.mockClear();
    const { GET: sseHandler } = await import("@/app/api/notifications/subscribe/route");

    await sseHandler(makeSSERequest());
    // notifications:all was already subscribed in previous test, should not subscribe again
    expect(mockRedisSub.subscribe).not.toHaveBeenCalledWith("notifications:all");
  });

  it("attaches a message handler to redisSub", async () => {
    vi.resetModules();
    mockRedisSub.on.mockClear();
    const { GET: sseHandler } = await import("@/app/api/notifications/subscribe/route");

    await sseHandler(makeSSERequest());
    expect(mockRedisSub.on).toHaveBeenCalledWith("message", expect.any(Function));
  });
});
