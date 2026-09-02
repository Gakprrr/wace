import { describe, it, expect, vi } from 'vitest';
/**
 * API Route tests — /api/notifications/push/subscribe
 */
import { Role } from "@prisma/client";
import { makeRequest } from "../setup/mocks";
import { generateToken } from "@/backend/services/auth.service";

vi.mock("@/backend/db", () => ({
  db: {
    user: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
    article: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn(), aggregate: vi.fn() },
    category: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    comment: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
    like: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), delete: vi.fn(), count: vi.fn() },
    notification: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    socialContact: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    pushSubscription: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  },
}));
vi.mock("@/backend/redis", () => ({
  redis: { on: vi.fn(), sadd: vi.fn().mockResolvedValue(1) },
  redisSub: { on: vi.fn(), subscribe: vi.fn() },
}));

import { db } from "@/backend/db";

import { POST as pushSubscribeHandler } from "@/app/api/notifications/push/subscribe/route";

const validSubscription = {
  endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
  keys: { auth: "authkey", p256dh: "p256key" },
};

describe("POST /api/notifications/push/subscribe", () => {
  it("returns 401 without authentication", async () => {
    const req = makeRequest("POST", "/api/notifications/push/subscribe", { body: validSubscription });
    const res = await pushSubscribeHandler(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when endpoint missing", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    const req = makeRequest("POST", "/api/notifications/push/subscribe", {
      token,
      body: { keys: { auth: "a", p256dh: "b" } },
    });
    const res = await pushSubscribeHandler(req);
    expect(res.status).toBe(400);
  });

  it("creates new subscription", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.pushSubscription.findFirst as any).mockResolvedValue(null);
    (db.pushSubscription.create as any).mockResolvedValue({ id: "ps1", userId: "u1", subscription: JSON.stringify(validSubscription) });

    const req = makeRequest("POST", "/api/notifications/push/subscribe", { token, body: validSubscription });
    const res = await pushSubscribeHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("updates existing subscription (upsert)", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.pushSubscription.findFirst as any).mockResolvedValue({ id: "ps1", userId: "u1", subscription: JSON.stringify(validSubscription) });
    (db.pushSubscription.update as any).mockResolvedValue({ id: "ps1" });

    const req = makeRequest("POST", "/api/notifications/push/subscribe", { token, body: validSubscription });
    const res = await pushSubscribeHandler(req);
    expect(res.status).toBe(200);
    expect(db.pushSubscription.update).toHaveBeenCalled();
  });
});
