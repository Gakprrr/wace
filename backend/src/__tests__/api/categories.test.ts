import { describe, it, expect, vi } from 'vitest';
/**
 * API Route tests — /api/categories/*
 */
import { Role } from "@prisma/client";
import { makeCategory, makeArticle, makeRequest } from "../setup/mocks";
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

import { GET as listHandler, POST as createHandler } from "@/app/api/categories/route";
import { GET as getHandler, PUT as updateHandler, DELETE as deleteHandler } from "@/app/api/categories/[idOrSlug]/route";

const params = (idOrSlug: string) => Promise.resolve({ idOrSlug });

// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/categories", () => {
  it("returns 200 with category list", async () => {
    (db.category.findMany as any).mockResolvedValue([makeCategory(), makeCategory({ id: "c2", slug: "femme" })]);
    const res = await listHandler();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/categories", () => {
  it("returns 401 without auth", async () => {
    const req = makeRequest("POST", "/api/categories", { body: { name: "Test", slug: "test" } });
    const res = await createHandler(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 for CLIENT", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    const req = makeRequest("POST", "/api/categories", { token, body: { name: "T", slug: "t" } });
    const res = await createHandler(req);
    expect(res.status).toBe(403);
  });

  it("returns 400 when name or slug missing", async () => {
    const token = await generateToken({ userId: "a1", email: "a@a.com", role: Role.ADMIN });
    const req = makeRequest("POST", "/api/categories", { token, body: { name: "Test" } });
    const res = await createHandler(req);
    expect(res.status).toBe(400);
  });

  it("returns 201 and creates category (admin)", async () => {
    const token = await generateToken({ userId: "a1", email: "a@a.com", role: Role.ADMIN });
    (db.category.create as any).mockResolvedValue(makeCategory());
    const req = makeRequest("POST", "/api/categories", { token, body: { name: "Homme", slug: "homme", icon: "👔" } });
    const res = await createHandler(req);
    expect(res.status).toBe(201);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/categories/[idOrSlug]", () => {
  it("returns 404 for unknown id/slug", async () => {
    (db.category.findUnique as any).mockResolvedValue(null);
    const res = await getHandler(makeRequest("GET", "/api/categories/ghost"), { params: params("ghost") });
    expect(res.status).toBe(404);
  });

  it("finds category by slug", async () => {
    const cat = makeCategory({ articles: [makeArticle()] });
    // First findUnique (by id) returns null, second (by slug) returns category
    db.category.findUnique
      .mockResolvedValueOnce(null)  // not found by id
      .mockResolvedValueOnce(cat);  // found by slug

    const res = await getHandler(makeRequest("GET", "/api/categories/vetements-homme"), { params: params("vetements-homme") });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.slug).toBe("vetements-homme");
  });

  it("finds category by id", async () => {
    const cat = makeCategory();
    (db.category.findUnique as any).mockResolvedValue(cat);
    const res = await getHandler(makeRequest("GET", "/api/categories/cat-1"), { params: params("cat-1") });
    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("PUT /api/categories/[idOrSlug]", () => {
  it("returns 401 without auth", async () => {
    const res = await updateHandler(makeRequest("PUT", "/api/categories/c1", { body: { name: "X" } }), { params: params("c1") });
  it("returns 200 on success (admin)", async () => {
    const token = await generateToken({ userId: "a1", email: "a@a.com", role: Role.ADMIN });
    (db.category.findUnique as any).mockResolvedValue(makeCategory());
    (db.category.delete as any).mockResolvedValue({ id: "cat-1" });
    const res = await deleteHandler(makeRequest("DELETE", "/api/categories/cat-1", { token }), { params: params("cat-1") });
    expect(res.status).toBe(200);
  });
});
