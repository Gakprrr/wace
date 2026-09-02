import { describe, it, expect, vi } from 'vitest';
/**
 * API Route tests — /api/comments/*
 */
import { Role } from "@prisma/client";
import { makeComment, makeRequest } from "../setup/mocks";
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

import { POST as createHandler } from "@/app/api/comments/route";
import { PUT as updateHandler, DELETE as deleteHandler } from "@/app/api/comments/[id]/route";
import { GET as listByArticleHandler } from "@/app/api/comments/article/[articleId]/route";

const params = (id: string) => Promise.resolve({ id });
const articleParams = (articleId: string) => Promise.resolve({ articleId });

// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/comments", () => {
  it("returns 401 without auth", async () => {
    const req = makeRequest("POST", "/api/comments", { body: { content: "test", articleId: "a1" } });
    const res = await createHandler(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when content or articleId missing", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    const req = makeRequest("POST", "/api/comments", { token, body: { content: "hi" } });
    const res = await createHandler(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 when article does not exist", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.article.findUnique as any).mockResolvedValue(null);

    const req = makeRequest("POST", "/api/comments", { token, body: { content: "hi", articleId: "ghost" } });
    const res = await createHandler(req);
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid rating", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.article.findUnique as any).mockResolvedValue({ id: "a1" });

    const req = makeRequest("POST", "/api/comments", { token, body: { content: "hi", articleId: "a1", rating: 10 } });
    const res = await createHandler(req);
    expect(res.status).toBe(400);
  });

  it("returns 201 on valid comment", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.article.findUnique as any).mockResolvedValue({ id: "a1" });
    (db.comment.create as any).mockResolvedValue(makeComment());

    const req = makeRequest("POST", "/api/comments", { token, body: { content: "Super!", articleId: "a1", rating: 5 } });
    const res = await createHandler(req);
    expect(res.status).toBe(201);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("GET /api/comments/article/[articleId]", () => {
  it("returns 200 with paginated comments", async () => {
    (db.comment.findMany as any).mockResolvedValue([makeComment(), makeComment({ id: "c2" })]);
    const res = await listByArticleHandler(
      makeRequest("GET", "/api/comments/article/a1"),
      { params: articleParams("a1") }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
  });

  it("respects limit and offset query params", async () => {
    (db.comment.findMany as any).mockResolvedValue([]);
    await listByArticleHandler(
      makeRequest("GET", "/api/comments/article/a1?limit=5&offset=10"),
      { params: articleParams("a1") }
    );
    const call = (db.comment.findMany as any).mock.calls[0][0];
    expect(call.take).toBe(5);
    expect(call.skip).toBe(10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("PUT /api/comments/[id]", () => {
  it("returns 401 without auth", async () => {
    const res = await updateHandler(makeRequest("PUT", "/api/comments/c1", { body: { content: "x" } }), { params: params("c1") });
    expect(res.status).toBe(401);
  });

  it("returns 400 when content empty", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    const res = await updateHandler(makeRequest("PUT", "/api/comments/c1", { token, body: {} }), { params: params("c1") });
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown comment", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.comment.findUnique as any).mockResolvedValue(null);
    const res = await updateHandler(makeRequest("PUT", "/api/comments/ghost", { token, body: { content: "x" } }), { params: params("ghost") });
    expect(res.status).toBe(404);
  });

  it("returns 400 when editing someone else's comment", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.comment.findUnique as any).mockResolvedValue(makeComment({ userId: "other" }));
    const res = await updateHandler(makeRequest("PUT", "/api/comments/c1", { token, body: { content: "hack" } }), { params: params("c1") });
    expect(res.status).toBe(400);
  });

  it("returns 200 when owner updates", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.comment.findUnique as any).mockResolvedValue(makeComment({ userId: "u1" }));
    (db.comment.update as any).mockResolvedValue(makeComment({ content: "Updated" }));

    const res = await updateHandler(makeRequest("PUT", "/api/comments/c1", { token, body: { content: "Updated" } }), { params: params("c1") });
    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("DELETE /api/comments/[id]", () => {
  it("returns 401 without auth", async () => {
    const res = await deleteHandler(makeRequest("DELETE", "/api/comments/c1"), { params: params("c1") });
    expect(res.status).toBe(401);
  });

  it("returns 403 when non-owner non-admin", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.comment.findUnique as any).mockResolvedValue(makeComment({ userId: "other" }));
    const res = await deleteHandler(makeRequest("DELETE", "/api/comments/c1", { token }), { params: params("c1") });
    expect(res.status).toBe(403);
  });

  it("returns 200 when owner deletes", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    (db.comment.findUnique as any).mockResolvedValue(makeComment({ userId: "u1" }));
    (db.comment.delete as any).mockResolvedValue({ id: "c1" });
    const res = await deleteHandler(makeRequest("DELETE", "/api/comments/c1", { token }), { params: params("c1") });
    expect(res.status).toBe(200);
  });

  it("returns 200 when admin deletes any comment", async () => {
    const token = await generateToken({ userId: "a1", email: "a@a.com", role: Role.ADMIN });
    (db.comment.findUnique as any).mockResolvedValue(makeComment({ userId: "someone" }));
    (db.comment.delete as any).mockResolvedValue({ id: "c1" });
    const res = await deleteHandler(makeRequest("DELETE", "/api/comments/c1", { token }), { params: params("c1") });
    expect(res.status).toBe(200);
  });
});
