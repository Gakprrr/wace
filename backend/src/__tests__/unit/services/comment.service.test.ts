import { describe, it, expect, vi } from 'vitest';
/**
 * Unit tests — comment.service.ts
 */
import { makeComment } from "../../setup/mocks";

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

import { createComment, getCommentsByArticle, updateComment, deleteComment } from "@/services/comment.service";
import { ValidationError, NotFoundError, ForbiddenError } from "@/utils/auth";

describe("createComment", () => {
  it("creates without rating (null)", async () => {
    (db.article.findUnique as any).mockResolvedValue({ id: "a1" });
    (db.comment.create as any).mockResolvedValue(makeComment({ rating: null }));
    await createComment({ content: "Bien", userId: "u1", articleId: "a1" });
    expect((db.comment.create as any).mock.calls[0][0].data.rating).toBeNull();
  });

  it("creates with valid rating 1-5", async () => {
    (db.article.findUnique as any).mockResolvedValue({ id: "a1" });
    (db.comment.create as any).mockResolvedValue(makeComment({ rating: 4 }));
    await createComment({ content: "OK", rating: 4, userId: "u1", articleId: "a1" });
    expect((db.comment.create as any).mock.calls[0][0].data.rating).toBe(4);
  });

  it("throws ValidationError for rating < 1", async () => {
    await expect(createComment({ content: "X", rating: 0, userId: "u1", articleId: "a1" }))
      .rejects.toThrow(ValidationError);
  });

  it("throws ValidationError for rating > 5", async () => {
    await expect(createComment({ content: "X", rating: 6, userId: "u1", articleId: "a1" }))
      .rejects.toThrow(ValidationError);
  });

  it("throws NotFoundError when article missing", async () => {
    (db.article.findUnique as any).mockResolvedValue(null);
    await expect(createComment({ content: "X", userId: "u1", articleId: "ghost" }))
      .rejects.toThrow(NotFoundError);
  });
});

describe("getCommentsByArticle", () => {
  it("uses default limit=20 offset=0", async () => {
    (db.comment.findMany as any).mockResolvedValue([]);
    await getCommentsByArticle("a1");
    const c = (db.comment.findMany as any).mock.calls[0][0];
    expect(c.take).toBe(20);
    expect(c.skip).toBe(0);
  });

  it("applies custom limit and offset", async () => {
    (db.comment.findMany as any).mockResolvedValue([]);
    await getCommentsByArticle("a1", 5, 10);
    const c = (db.comment.findMany as any).mock.calls[0][0];
    expect(c.take).toBe(5);
    expect(c.skip).toBe(10);
  });

  it("orders by createdAt desc", async () => {
    (db.comment.findMany as any).mockResolvedValue([]);
    await getCommentsByArticle("a1");
    expect((db.comment.findMany as any).mock.calls[0][0].orderBy).toEqual({ createdAt: "desc" });
  });
});

describe("updateComment", () => {
  it("updates content when owner", async () => {
    (db.comment.findUnique as any).mockResolvedValue(makeComment({ userId: "u1" }));
    (db.comment.update as any).mockResolvedValue(makeComment({ content: "Updated" }));
    await updateComment("c1", "u1", "Updated");
    expect((db.comment.update as any).mock.calls[0][0].data).toEqual({ content: "Updated" });
  });

  it("throws NotFoundError for unknown comment", async () => {
    (db.comment.findUnique as any).mockResolvedValue(null);
    await expect(updateComment("ghost", "u1", "text")).rejects.toThrow(NotFoundError);
  });

  it("throws ValidationError when not owner", async () => {
    (db.comment.findUnique as any).mockResolvedValue(makeComment({ userId: "other" }));
    await expect(updateComment("c1", "u1", "hack")).rejects.toThrow(ValidationError);
  });
});

describe("deleteComment", () => {
  it("owner can delete own comment", async () => {
    (db.comment.findUnique as any).mockResolvedValue(makeComment({ userId: "u1" }));
    (db.comment.delete as any).mockResolvedValue({ id: "c1" });
    await deleteComment("c1", "u1", false);
    expect(db.comment.delete).toHaveBeenCalled();
  });

  it("admin can delete any comment", async () => {
    (db.comment.findUnique as any).mockResolvedValue(makeComment({ userId: "other" }));
    (db.comment.delete as any).mockResolvedValue({ id: "c1" });
    await deleteComment("c1", "admin", true);
    expect(db.comment.delete).toHaveBeenCalled();
  });

  it("throws ForbiddenError for non-owner non-admin", async () => {
    (db.comment.findUnique as any).mockResolvedValue(makeComment({ userId: "other" }));
    await expect(deleteComment("c1", "u1", false)).rejects.toThrow(ForbiddenError);
  });

  it("throws NotFoundError for ghost comment", async () => {
    (db.comment.findUnique as any).mockResolvedValue(null);
    await expect(deleteComment("ghost", "u1", false)).rejects.toThrow(NotFoundError);
  });
});
