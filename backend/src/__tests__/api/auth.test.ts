import { describe, it, expect, vi } from 'vitest';
/**
 * API Route tests — /api/auth/*
 * Tests every handler: login, register, session, logout, 2FA setup/verify/disable
 */
import { Role } from "@prisma/client";
import { makeUser, makeAdmin, makeRequest } from "../setup/mocks";
import { generateToken } from "@/services/auth.service";

// ── Module mocks (must be before imports) ─────────────────────────────────────

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
vi.mock("@/middleware/rateLimit", () => ({
  withRateLimit: vi.fn().mockResolvedValue(null), // never rate-limit in tests
}));
vi.mock("@/services/twoFactor", () => ({
  generate2FASecret: vi.fn().mockResolvedValue({ secret: "BASE32SECRET", qrCode: "data:image/png;base64,fake" }),
  verify2FAToken: vi.fn().mockReturnValue(true),
  save2FASecret: vi.fn().mockResolvedValue({}),
  confirm2FA: vi.fn().mockResolvedValue({}),
  disable2FA: vi.fn().mockResolvedValue({}),
}));

import { db } from "@/db";

import { POST as loginHandler } from "@/app/api/auth/login/route";
import { POST as registerHandler } from "@/app/api/auth/register/route";
import { GET as sessionHandler } from "@/app/api/auth/session/route";
import { POST as logoutHandler } from "@/app/api/auth/logout/route";
import { POST as setup2faHandler } from "@/app/api/auth/2fa/setup/route";
import { POST as verify2faHandler } from "@/app/api/auth/2fa/verify/route";
import { POST as disable2faHandler } from "@/app/api/auth/2fa/disable/route";
import { verify2FAToken } from "@/services/twoFactor";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  it("returns 400 when email or password missing", async () => {
    const req = makeRequest("POST", "/api/auth/login", { body: { email: "a@a.com" } });
    const res = await loginHandler(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 for unknown email", async () => {
    (db.user.findUnique as any).mockResolvedValue(null);
    const req = makeRequest("POST", "/api/auth/login", { body: { email: "ghost@a.com", password: "pass" } });
    const res = await loginHandler(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 for wrong password", async () => {
    // bcrypt hash of "correct_password"
    const { hashPassword } = await import("@/services/auth.service");
    const hash = await hashPassword("correct_password");
    (db.user.findUnique as any).mockResolvedValue(makeUser({ password: hash }));

    const req = makeRequest("POST", "/api/auth/login", { body: { email: "test@wace.com", password: "wrong" } });
    const res = await loginHandler(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 for suspended account", async () => {
    const { hashPassword } = await import("@/services/auth.service");
    const hash = await hashPassword("pass123");
    (db.user.findUnique as any).mockResolvedValue(makeUser({ password: hash, isActive: false }));

    const req = makeRequest("POST", "/api/auth/login", { body: { email: "test@wace.com", password: "pass123" } });
    const res = await loginHandler(req);
    expect(res.status).toBe(403);
  });

  it("returns 200 with token and cookie on valid login", async () => {
    const { hashPassword } = await import("@/services/auth.service");
    const hash = await hashPassword("secret123");
    (db.user.findUnique as any).mockResolvedValue(makeUser({ password: hash }));

    const req = makeRequest("POST", "/api/auth/login", { body: { email: "test@wace.com", password: "secret123" } });
    const res = await loginHandler(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.token).toBeDefined();
    expect(body.user.email).toBe("test@wace.com");
    expect(res.headers.get("set-cookie")).toContain("token=");
  });

  it("returns requires2FA=true with tempToken when 2FA enabled", async () => {
    const { hashPassword } = await import("@/services/auth.service");
    const hash = await hashPassword("pass");
    (db.user.findUnique as any).mockResolvedValue(makeUser({ password: hash, twoFactorEnabled: true }));

    const req = makeRequest("POST", "/api/auth/login", { body: { email: "test@wace.com", password: "pass" } });
    const res = await loginHandler(req);
    const body = await res.json();
    expect(body.requires2FA).toBe(true);
    expect(body.tempToken).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  it("returns 400 when email missing", async () => {
    const req = makeRequest("POST", "/api/auth/register", { body: { password: "abc123" } });
    const res = await registerHandler(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email format", async () => {
    const req = makeRequest("POST", "/api/auth/register", { body: { email: "notanemail", password: "abc123" } });
    const res = await registerHandler(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for password < 6 chars", async () => {
    const req = makeRequest("POST", "/api/auth/register", { body: { email: "a@b.com", password: "12345" } });
    const res = await registerHandler(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when email already exists", async () => {
    (db.user.findUnique as any).mockResolvedValue(makeUser());
    const req = makeRequest("POST", "/api/auth/register", { body: { email: "test@wace.com", password: "abc123" } });
    const res = await registerHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/existe déjà/);
  });

  it("returns 201 and creates user", async () => {
    (db.user.findUnique as any).mockResolvedValue(null);
    (db.user.create as any).mockResolvedValue(makeUser({ email: "new@wace.com" }));

    const req = makeRequest("POST", "/api/auth/register", { body: { email: "new@wace.com", password: "secure123" } });
    const res = await registerHandler(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/session
// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/auth/session", () => {
  it("returns 401 when no token", async () => {
    const req = makeRequest("GET", "/api/auth/session");
    const res = await sessionHandler(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.authenticated).toBe(false);
  });

  it("returns authenticated=true with valid token", async () => {
    const token = await generateToken({ userId: "u1", email: "t@t.com", role: Role.CLIENT });
    const profile = { id: "u1", email: "t@t.com", name: "T", role: Role.CLIENT, twoFactorEnabled: false, isActive: true, createdAt: new Date() };
    (db.user.findUnique as any).mockResolvedValue(profile);

    const req = makeRequest("GET", "/api/auth/session", { token });
    const res = await sessionHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.authenticated).toBe(true);
    expect(body.user.email).toBe("t@t.com");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/auth/logout", () => {
  it("clears token cookie and returns 200", async () => {
    const res = await logoutHandler();
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("token=");
    expect(res.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/2fa/setup
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/auth/2fa/setup", () => {
  it("returns 401 without token", async () => {
    const req = makeRequest("POST", "/api/auth/2fa/setup");
    const res = await setup2faHandler(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when 2FA already enabled", async () => {
    const token = await generateToken({ userId: "u1", email: "t@t.com", role: Role.CLIENT });
    (db.user.findUnique as any).mockResolvedValue(makeUser({ twoFactorEnabled: true }));

    const req = makeRequest("POST", "/api/auth/2fa/setup", { token });
    const res = await setup2faHandler(req);
    expect(res.status).toBe(400);
  });

  it("returns secret and qrCode on success", async () => {
    const token = await generateToken({ userId: "u1", email: "t@t.com", role: Role.CLIENT });
    (db.user.findUnique as any).mockResolvedValue(makeUser({ twoFactorEnabled: false }));
    (db.user.update as any).mockResolvedValue({});

    const req = makeRequest("POST", "/api/auth/2fa/setup", { token });
    const res = await setup2faHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.secret).toBe("BASE32SECRET");
    expect(body.qrCode).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/2fa/verify
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/auth/2fa/verify", () => {
  it("returns 400 when token field missing", async () => {
    const jwt = await generateToken({ userId: "u1", email: "t@t.com", role: Role.CLIENT });
    const req = makeRequest("POST", "/api/auth/2fa/verify", { token: jwt, body: {} });
    const res = await verify2faHandler(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 for invalid TOTP code", async () => {
    (verify2FAToken as any).mockReturnValueOnce(false);
    const jwt = await generateToken({ userId: "u1", email: "t@t.com", role: Role.CLIENT });
    (db.user.findUnique as any).mockResolvedValue(makeUser({ twoFactorSecret: "SECRET", twoFactorEnabled: true }));

    const req = makeRequest("POST", "/api/auth/2fa/verify", { token: jwt, body: { token: "000000" } });
    const res = await verify2faHandler(req);
    expect(res.status).toBe(401);
  });

  it("returns new JWT and cookie on valid TOTP", async () => {
    (verify2FAToken as any).mockReturnValueOnce(true);
    const jwt = await generateToken({ userId: "u1", email: "t@t.com", role: Role.CLIENT });
    (db.user.findUnique as any).mockResolvedValue(makeUser({ twoFactorSecret: "SECRET", twoFactorEnabled: true }));

    const req = makeRequest("POST", "/api/auth/2fa/verify", { token: jwt, body: { token: "123456" } });
    const res = await verify2faHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.token).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/2fa/disable
// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/auth/2fa/disable", () => {
  it("returns 401 without token", async () => {
    const req = makeRequest("POST", "/api/auth/2fa/disable", { body: { token: "123456" } });
    const res = await disable2faHandler(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when TOTP code not provided", async () => {
    const jwt = await generateToken({ userId: "u1", email: "t@t.com", role: Role.CLIENT });
    const req = makeRequest("POST", "/api/auth/2fa/disable", { token: jwt, body: {} });
    const res = await disable2faHandler(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 for wrong TOTP code", async () => {
    (verify2FAToken as any).mockReturnValueOnce(false);
    const jwt = await generateToken({ userId: "u1", email: "t@t.com", role: Role.CLIENT });
    (db.user.findUnique as any).mockResolvedValue(makeUser({ twoFactorSecret: "SECRET", twoFactorEnabled: true }));

    const req = makeRequest("POST", "/api/auth/2fa/disable", { token: jwt, body: { token: "000000" } });
    const res = await disable2faHandler(req);
    expect(res.status).toBe(401);
  });

  it("disables 2FA successfully with correct TOTP", async () => {
    (verify2FAToken as any).mockReturnValueOnce(true);
    const jwt = await generateToken({ userId: "u1", email: "t@t.com", role: Role.CLIENT });
    (db.user.findUnique as any).mockResolvedValue(makeUser({ twoFactorSecret: "SECRET", twoFactorEnabled: true }));

    const req = makeRequest("POST", "/api/auth/2fa/disable", { token: jwt, body: { token: "123456" } });
    const res = await disable2faHandler(req);
    expect(res.status).toBe(200);
  });
});
