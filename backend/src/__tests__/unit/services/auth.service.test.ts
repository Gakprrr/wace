import { describe, it, expect, vi, afterEach } from 'vitest';
/**
 * Unit tests — auth.service.ts
 * Uses REAL jose + bcryptjs (no mock), only mocks the DB.
 */
import { Role } from "@prisma/client";
import { makeUser } from "../../setup/mocks";

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

import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  registerUser,
  findUserByEmail,
  findUserById,
  getUserProfile,
  updateUserProfile,
  toggleUserActive,
  deleteUserByAdmin,
  listAllUsers,
} from "@/services/auth.service";

// ─────────────────────────────────────────────────────────────────────────────

afterEach(() => {
  vi.clearAllMocks();
});

describe("hashPassword / comparePassword", () => {
  it("hashes a password and verifies it correctly", async () => {
    const hash = await hashPassword("MySecurePass!123");
    expect(hash).toMatch(/^\$2/);
    expect(await comparePassword("MySecurePass!123", hash)).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword("correct");
    expect(await comparePassword("wrong", hash)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("generateToken / verifyToken", () => {
  const payload = { userId: "u1", email: "a@b.com", role: Role.CLIENT };

  it("roundtrips: generate → verify", async () => {
    const token = await generateToken(payload);
    expect(token.split(".")).toHaveLength(3);
    const decoded = await verifyToken(token);
    expect(decoded?.userId).toBe("u1");
    expect(decoded?.role).toBe(Role.CLIENT);
  });

  it("returns null for invalid token", async () => {
    expect(await verifyToken("not.a.jwt")).toBeNull();
  });

  it("returns null for tampered token", async () => {
    const token = await generateToken(payload);
    expect(await verifyToken(token.slice(0, -4) + "XXXX")).toBeNull();
  });

  it("expired token (1ms TTL) returns null", async () => {
    const token = await generateToken(payload, "1ms");
    await new Promise((r) => setTimeout(r, 50)); // 50ms wait — token exp is already in the past
    const result = await verifyToken(token);
    expect(result).toBeNull();
  });

  it("embeds twoFactorVerified in payload", async () => {
    const token = await generateToken({ ...payload, twoFactorVerified: true });
    expect((await verifyToken(token))?.twoFactorVerified).toBe(true);
  });

  it("temp token (10m) is valid immediately", async () => {
    const token = await generateToken(payload, "10m");
    expect(await verifyToken(token)).not.toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("registerUser", () => {
  it("hashes password and calls db.user.create with CLIENT role", async () => {
    (db.user.create as any).mockResolvedValue(makeUser());
    await registerUser({ email: "new@wace.com", password: "Pass123!" });

    const data = (db.user.create as any).mock.calls[0][0].data;
    expect(data.password).toMatch(/^\$2/);
    expect(data.role).toBe(Role.CLIENT);
  });

  it("creates OAuth user with null password", async () => {
    (db.user.create as any).mockResolvedValue(makeUser({ password: null }));
    await registerUser({ email: "oauth@gmail.com" });
    expect((db.user.create as any).mock.calls[0][0].data.password).toBeNull();
  });

  it("can create ADMIN role", async () => {
    (db.user.create as any).mockResolvedValue(makeUser({ role: Role.ADMIN }));
    await registerUser({ email: "a@wace.com", password: "p", role: Role.ADMIN });
    expect((db.user.create as any).mock.calls[0][0].data.role).toBe(Role.ADMIN);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("findUserByEmail", () => {
  it("returns user", async () => {
    (db.user.findUnique as any).mockResolvedValue(makeUser());
    expect(await findUserByEmail("test@wace.com")).toBeDefined();
  });

  it("returns null when not found", async () => {
    (db.user.findUnique as any).mockResolvedValue(null);
    expect(await findUserByEmail("ghost@wace.com")).toBeNull();
  });
});

describe("findUserById", () => {
  it("finds by id", async () => {
    (db.user.findUnique as any).mockResolvedValue(makeUser());
    expect(await findUserById("user-1")).toBeDefined();
  });
});

describe("getUserProfile", () => {
  it("does not expose password field", async () => {
    const profile = { id: "u1", email: "e@e.com", name: "N", role: Role.CLIENT, twoFactorEnabled: false, isActive: true, createdAt: new Date() };
    (db.user.findUnique as any).mockResolvedValue(profile);
    const result = await getUserProfile("u1");
    expect((result as Record<string, unknown>)?.password).toBeUndefined();
  });
});

describe("updateUserProfile", () => {
  it("calls update with correct data", async () => {
    (db.user.update as any).mockResolvedValue(makeUser({ name: "New" }));
    await updateUserProfile("u1", { name: "New" });
    expect((db.user.update as any).mock.calls[0][0].data).toMatchObject({ name: "New" });
  });
});

describe("toggleUserActive", () => {
  it("suspends user (false)", async () => {
    (db.user.update as any).mockResolvedValue({ id: "u1", isActive: false });
    await toggleUserActive("u1", false);
    expect((db.user.update as any).mock.calls[0][0].data).toEqual({ isActive: false });
  });

  it("reactivates user (true)", async () => {
    (db.user.update as any).mockResolvedValue({ id: "u1", isActive: true });
    await toggleUserActive("u1", true);
    expect((db.user.update as any).mock.calls[0][0].data).toEqual({ isActive: true });
  });
});

describe("listAllUsers", () => {
  it("returns ordered list", async () => {
    (db.user.findMany as any).mockResolvedValue([makeUser(), makeUser({ id: "u2" })]);
    const result = await listAllUsers();
    expect(result).toHaveLength(2);
    expect((db.user.findMany as any).mock.calls[0][0].orderBy).toEqual({ createdAt: "desc" });
  });
});

describe("deleteUserByAdmin", () => {
  it("deletes user", async () => {
    (db.user.delete as any).mockResolvedValue({ id: "u1" });
    await deleteUserByAdmin("u1");
    expect(db.user.delete).toHaveBeenCalledWith({ where: { id: "u1" } });
  });
});
