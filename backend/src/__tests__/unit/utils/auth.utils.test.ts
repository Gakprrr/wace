import { describe, it, expect, vi } from 'vitest';
/**
 * Unit tests — utils/auth.ts
 * Tests errorResponse mapping + getUserFromRequest + requireAuth + requireAdmin
 */
import { Role } from "@prisma/client";
import { makeMockDb } from "../../setup/mocks";

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

// auth.utils.test.ts doesn't actually use db, but the mock is kept for consistency
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { db } from "@/db";

import {
  errorResponse,
  getUserFromRequest,
  requireAuth,
  requireAdmin,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/utils/auth";
import { generateToken } from "@/services/auth.service";

// ─────────────────────────────────────────────────────────────────────────────

describe("errorResponse", () => {
  it("maps UnauthorizedError → 401", () => {
    const r = errorResponse(new UnauthorizedError("Unauthorized"));
    expect(r).toEqual({ error: "Unauthorized", status: 401 });
  });

  it("maps ForbiddenError → 403", () => {
    const r = errorResponse(new ForbiddenError("Forbidden"));
    expect(r).toEqual({ error: "Forbidden", status: 403 });
  });

  it("maps NotFoundError → 404", () => {
    const r = errorResponse(new NotFoundError("Not found"));
    expect(r).toEqual({ error: "Not found", status: 404 });
  });

  it("maps ValidationError → 400", () => {
    const r = errorResponse(new ValidationError("Bad input"));
    expect(r).toEqual({ error: "Bad input", status: 400 });
  });

  it("maps Prisma record-not-found error → 404", () => {
    const r = errorResponse(new Error("Record to update does not exist"));
    expect(r.status).toBe(404);
  });

  it("maps Prisma unique constraint error → 409", () => {
    const r = errorResponse(new Error("Unique constraint failed on the fields"));
    expect(r.status).toBe(409);
  });

  it("maps Prisma FK error → 400", () => {
    const r = errorResponse(new Error("Foreign key constraint failed"));
    expect(r.status).toBe(400);
  });

  it("unknown Error → 500", () => {
    const r = errorResponse(new Error("Something blew up"));
    expect(r.status).toBe(500);
  });

  it("non-Error value → 500 with fallback", () => {
    const r = errorResponse("oops");
    expect(r.status).toBe(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("getUserFromRequest", () => {
  async function tokenFor(role: Role, userId = "u1") {
    return generateToken({ userId, email: "t@t.com", role, twoFactorVerified: true });
  }

  it("extracts payload from Bearer Authorization header", async () => {
    const token = await tokenFor(Role.CLIENT);
    const req = new Request("http://localhost/test", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await getUserFromRequest(req);
    expect(user?.userId).toBe("u1");
    expect(user?.role).toBe(Role.CLIENT);
  });

  it("extracts payload from cookie header", async () => {
    const token = await tokenFor(Role.ADMIN, "admin-1");
    const req = new Request("http://localhost/test", {
      headers: { cookie: `token=${token}; other=val` },
    });
    const user = await getUserFromRequest(req);
    expect(user?.role).toBe(Role.ADMIN);
  });

  it("returns null when no token present", async () => {
    const req = new Request("http://localhost/test");
    expect(await getUserFromRequest(req)).toBeNull();
  });

  it("returns null for invalid token", async () => {
    const req = new Request("http://localhost/test", {
      headers: { Authorization: "Bearer invalid.token.here" },
    });
    expect(await getUserFromRequest(req)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("requireAuth", () => {
  it("returns user for valid token", async () => {
    const token = await generateToken({ userId: "u1", email: "e@e.com", role: Role.CLIENT });
    const req = new Request("http://localhost/test", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await requireAuth(req);
    expect(user.userId).toBe("u1");
  });

  it("throws UnauthorizedError when no token", async () => {
    const req = new Request("http://localhost/test");
    await expect(requireAuth(req)).rejects.toThrow(UnauthorizedError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("requireAdmin", () => {
  it("passes for ADMIN role", async () => {
    const token = await generateToken({ userId: "a1", email: "a@a.com", role: Role.ADMIN });
    const req = new Request("http://localhost/test", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await requireAdmin(req);
    expect(user.role).toBe(Role.ADMIN);
  });

  it("throws ForbiddenError for CLIENT role", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    const req = new Request("http://localhost/test", {
      headers: { Authorization: `Bearer ${token}` },
    });
    await expect(requireAdmin(req)).rejects.toThrow(ForbiddenError);
  });

  it("throws UnauthorizedError when no token", async () => {
    const req = new Request("http://localhost/test");
    await expect(requireAdmin(req)).rejects.toThrow(UnauthorizedError);
  });
});
