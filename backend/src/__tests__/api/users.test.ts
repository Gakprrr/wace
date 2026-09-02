import { describe, it, expect, vi } from 'vitest';
/**
 * API Route tests — /api/users/me/*
 */
import { Role } from "@prisma/client";
import { makeUser, makeArticle, makeNotification, makeRequest } from "../setup/mocks";
import { generateToken } from "@/services/auth.service";

vi.mock("@/db", () => ({
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

import { db } from "@/db";

import { GET as profileGet, PUT as profilePut } from "@/app/api/users/me/route";
import { GET as likesGet } from "@/app/api/users/me/likes/route";
import { GET as notifsGet } from "@/app/api/users/me/notifications/route";
import { PUT as markReadHandler } from "@/app/api/users/me/notifications/[id]/read/route";

const params = (id: string) => Promise.resolve({ id });

// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/users/me", () => {
  it("returns 401 without auth", async () => {
    const res = await profileGet(makeRequest("GET", "/api/users/me"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when user not found in DB", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.user.findUnique as any).mockResolvedValue(null);
    const res = await profileGet(makeRequest("GET", "/api/users/me", { token }));
    expect(res.status).toBe(404);
  });

  it("returns 200 with profile", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.user.findUnique as any).mockResolvedValue(makeUser());
    const res = await profileGet(makeRequest("GET", "/api/users/me", { token }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.email).toBe("test@wace.com");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("PUT /api/users/me", () => {
  it("returns 401 without auth", async () => {
    const res = await profilePut(makeRequest("PUT", "/api/users/me", { body: { name: "X" } }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid avatar URL (non-Cloudinary)", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    const res = await profilePut(makeRequest("PUT", "/api/users/me", {
      token,
      body: { avatar: "https://evil.com/tracker.gif" },
    }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid phone number", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    const res = await profilePut(makeRequest("PUT", "/api/users/me", {
      token,
      body: { phone: "<script>alert(1)</script>" },
    }));
    expect(res.status).toBe(400);
  });

  it("accepts valid Cloudinary avatar URL", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.user.update as any).mockResolvedValue(makeUser({ avatar: "https://res.cloudinary.com/wace/image/upload/v1/test.jpg" }));
    const res = await profilePut(makeRequest("PUT", "/api/users/me", {
      token,
      body: { avatar: "https://res.cloudinary.com/wace/image/upload/v1/test.jpg" },
    }));
    expect(res.status).toBe(200);
  });

  it("updates name without avatar", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.user.update as any).mockResolvedValue(makeUser({ name: "New Name" }));
    const res = await profilePut(makeRequest("PUT", "/api/users/me", { token, body: { name: "New Name" } }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("New Name");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/users/me/likes", () => {
  it("returns 401 without auth", async () => {
    const res = await likesGet(makeRequest("GET", "/api/users/me/likes"));
    expect(res.status).toBe(401);
  });

  it("returns liked articles", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.like.findMany as any).mockResolvedValue([{ id: "l1", article: makeArticle() }]);
    const res = await likesGet(makeRequest("GET", "/api/users/me/likes", { token }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/users/me/notifications", () => {
  it("returns 401 without auth", async () => {
    const res = await notifsGet(makeRequest("GET", "/api/users/me/notifications"));
    expect(res.status).toBe(401);
  });

  it("returns user notifications", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.notification.findMany as any).mockResolvedValue([makeNotification(), makeNotification({ id: "n2" })]);
    const res = await notifsGet(makeRequest("GET", "/api/users/me/notifications", { token }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("PUT /api/users/me/notifications/[id]/read", () => {
  it("returns 401 without auth", async () => {
    const res = await markReadHandler(makeRequest("PUT", "/api/users/me/notifications/n1/read"), { params: params("n1") });
    expect(res.status).toBe(401);
  });

  it("returns 404 for unknown notification", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.notification.findUnique as any).mockResolvedValue(null);
    const res = await markReadHandler(makeRequest("PUT", "/api/users/me/notifications/ghost/read", { token }), { params: params("ghost") });
    expect(res.status).toBe(404);
  });

  it("returns 403 when notification belongs to different user", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.notification.findUnique as any).mockResolvedValue(makeNotification({ userId: "other-user" }));
    const res = await markReadHandler(makeRequest("PUT", "/api/users/me/notifications/n1/read", { token }), { params: params("n1") });
    expect(res.status).toBe(403);
  });

  it("marks notification as read", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.notification.findUnique as any).mockResolvedValue(makeNotification({ userId: "u1" }));
    (db.notification.update as any).mockResolvedValue({ ...makeNotification({ userId: "u1" }), isRead: true });
    const res = await markReadHandler(makeRequest("PUT", "/api/users/me/notifications/n1/read", { token }), { params: params("n1") });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isRead).toBe(true);
  });
});
