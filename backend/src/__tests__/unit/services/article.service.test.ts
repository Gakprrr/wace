import { describe, it, expect, vi } from 'vitest';
/**
 * Unit tests — article.service.ts
 */
import { ItemState, Prisma } from "@prisma/client";
import { makeArticle, makeCategory } from "../../setup/mocks";

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
  createArticle, getArticles, getArticleById, updateArticle, deleteArticle,
  updateArticleStock, updateArticlePrice, toggleArticleLike, getArticleLikes,
  getUserLikedArticles, searchArticles, getFeaturedArticles,
  createCategory, getCategories, getCategoryBySlug, updateCategory, deleteCategory,
} from "@/services/article.service";

// ── Categories ────────────────────────────────────────────────────────────────

describe("createCategory", () => {
  it("creates with all fields", async () => {
    (db.category.create as any).mockResolvedValue(makeCategory());
    await createCategory("Homme", "homme", "👔");
    const d = (db.category.create as any).mock.calls[0][0].data;
    expect(d).toEqual({ name: "Homme", slug: "homme", icon: "👔" });
  });

  it("creates without icon", async () => {
    (db.category.create as any).mockResolvedValue(makeCategory({ icon: undefined }));
    await createCategory("Femme", "femme");
    expect((db.category.create as any).mock.calls[0][0].data.icon).toBeUndefined();
  });
});

describe("getCategories", () => {
  it("includes article count", async () => {
    (db.category.findMany as any).mockResolvedValue([makeCategory()]);
    await getCategories();
    expect(db.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: { _count: { select: { articles: true } } } })
    );
  });
});

describe("getCategoryBySlug", () => {
  it("returns null for unknown slug", async () => {
    (db.category.findUnique as any).mockResolvedValue(null);
    expect(await getCategoryBySlug("nope")).toBeNull();
  });
});

describe("updateCategory", () => {
  it("updates fields", async () => {
    (db.category.update as any).mockResolvedValue(makeCategory({ name: "New" }));
    await updateCategory("cat-1", { name: "New" });
    expect((db.category.update as any).mock.calls[0][0].data).toMatchObject({ name: "New" });
  });
});

describe("deleteCategory", () => {
  it("deletes by id", async () => {
    (db.category.delete as any).mockResolvedValue({ id: "cat-1" });
    await deleteCategory("cat-1");
    expect(db.category.delete).toHaveBeenCalledWith({ where: { id: "cat-1" } });
  });
});

// ── Articles ──────────────────────────────────────────────────────────────────

describe("createArticle", () => {
  it("converts price to Decimal", async () => {
    (db.article.create as any).mockResolvedValue(makeArticle());
    await createArticle({ title: "T", description: "D", price: 3500, stock: 1, state: ItemState.BON_ETAT, images: [], categoryId: "c1" });
    const d = (db.article.create as any).mock.calls[0][0].data;
    expect(d.price).toBeInstanceOf(Prisma.Decimal);
    expect(d.price.toString()).toBe("3500");
  });

  it("sets oldPrice as Decimal when provided", async () => {
    (db.article.create as any).mockResolvedValue(makeArticle());
    await createArticle({ title: "T", description: "D", price: 4000, oldPrice: 10000, stock: 1, state: ItemState.NEUF, images: [], categoryId: "c1" });
    const d = (db.article.create as any).mock.calls[0][0].data;
    expect(d.oldPrice).toBeInstanceOf(Prisma.Decimal);
    expect(d.oldPrice.toString()).toBe("10000");
  });

  it("sets oldPrice to null when omitted", async () => {
    (db.article.create as any).mockResolvedValue(makeArticle());
    await createArticle({ title: "T", description: "D", price: 4000, stock: 1, state: ItemState.NEUF, images: [], categoryId: "c1" });
    expect((db.article.create as any).mock.calls[0][0].data.oldPrice).toBeNull();
  });

  it("defaults isAvailable=true, isNew=false", async () => {
    (db.article.create as any).mockResolvedValue(makeArticle());
    await createArticle({ title: "T", description: "D", price: 1000, stock: 1, state: ItemState.BON_ETAT, images: [], categoryId: "c1" });
    const d = (db.article.create as any).mock.calls[0][0].data;
    expect(d.isAvailable).toBe(true);
    expect(d.isNew).toBe(false);
  });
});

describe("getArticles", () => {
  it("returns all with no filters", async () => {
    (db.article.findMany as any).mockResolvedValue([makeArticle()]);
    const r = await getArticles();
    expect(r).toHaveLength(1);
  });

  it("applies categoryId filter", async () => {
    (db.article.findMany as any).mockResolvedValue([]);
    await getArticles({ categoryId: "cat-2" });
    expect((db.article.findMany as any).mock.calls[0][0].where.categoryId).toBe("cat-2");
  });

  it("applies state filter", async () => {
    (db.article.findMany as any).mockResolvedValue([]);
    await getArticles({ state: ItemState.NEUF });
    expect((db.article.findMany as any).mock.calls[0][0].where.state).toBe(ItemState.NEUF);
  });

  it("applies price range", async () => {
    (db.article.findMany as any).mockResolvedValue([]);
    await getArticles({ minPrice: 1000, maxPrice: 5000 });
    const w = (db.article.findMany as any).mock.calls[0][0].where;
    expect(w.price.gte).toBe(1000);
    expect(w.price.lte).toBe(5000);
  });

  it("applies isAvailable=false", async () => {
    (db.article.findMany as any).mockResolvedValue([]);
    await getArticles({ isAvailable: false });
    expect((db.article.findMany as any).mock.calls[0][0].where.isAvailable).toBe(false);
  });

  it("applies limit and offset", async () => {
    (db.article.findMany as any).mockResolvedValue([]);
    await getArticles({ limit: 10, offset: 20 });
    const c = (db.article.findMany as any).mock.calls[0][0];
    expect(c.take).toBe(10);
    expect(c.skip).toBe(20);
  });
});

describe("getArticleById", () => {
  it("returns null for unknown id", async () => {
    (db.article.findUnique as any).mockResolvedValue(null);
    expect(await getArticleById("ghost")).toBeNull();
  });

  it("returns article with comments", async () => {
    const a = { ...makeArticle(), comments: [] };
    (db.article.findUnique as any).mockResolvedValue(a);
    expect(await getArticleById("article-1")).toEqual(a);
  });
});

describe("updateArticle", () => {
  it("only sets provided fields", async () => {
    (db.article.update as any).mockResolvedValue(makeArticle());
    await updateArticle("article-1", { title: "New Title" });
    const d = (db.article.update as any).mock.calls[0][0].data;
    expect(d.title).toBe("New Title");
    expect(d.price).toBeUndefined();
  });

  it("converts price to Decimal", async () => {
    (db.article.update as any).mockResolvedValue(makeArticle());
    await updateArticle("article-1", { price: 5000 });
    expect((db.article.update as any).mock.calls[0][0].data.price).toBeInstanceOf(Prisma.Decimal);
  });

  it("connects categoryId via relation", async () => {
    (db.article.update as any).mockResolvedValue(makeArticle());
    await updateArticle("article-1", { categoryId: "cat-99" });
    expect((db.article.update as any).mock.calls[0][0].data.category).toEqual({ connect: { id: "cat-99" } });
  });
});

describe("updateArticleStock", () => {
  it("isAvailable=true when stock > 0", async () => {
    (db.article.update as any).mockResolvedValue(makeArticle());
    await updateArticleStock("a1", 3);
    expect((db.article.update as any).mock.calls[0][0].data.isAvailable).toBe(true);
  });

  it("isAvailable=false when stock = 0", async () => {
    (db.article.update as any).mockResolvedValue(makeArticle({ stock: 0 }));
    await updateArticleStock("a1", 0);
    expect((db.article.update as any).mock.calls[0][0].data.isAvailable).toBe(false);
  });
});

describe("updateArticlePrice", () => {
  it("sets both price and oldPrice as Decimals", async () => {
    (db.article.update as any).mockResolvedValue(makeArticle());
    await updateArticlePrice("a1", 3000, 8000);
    const d = (db.article.update as any).mock.calls[0][0].data;
    expect(d.price.toString()).toBe("3000");
    expect(d.oldPrice.toString()).toBe("8000");
  });
});

describe("deleteArticle", () => {
  it("calls delete with id", async () => {
    (db.article.delete as any).mockResolvedValue({ id: "a1" });
    await deleteArticle("a1");
    expect(db.article.delete).toHaveBeenCalledWith({ where: { id: "a1" } });
  });
});

// ── Likes ─────────────────────────────────────────────────────────────────────

describe("toggleArticleLike", () => {
  it("creates like when none exists → liked: true", async () => {
    (db.like.findUnique as any).mockResolvedValue(null);
    (db.like.create as any).mockResolvedValue({ id: "l1" });
    expect(await toggleArticleLike("u1", "a1")).toEqual({ liked: true });
  });

  it("removes existing like → liked: false", async () => {
    (db.like.findUnique as any).mockResolvedValue({ id: "l1" });
    (db.like.delete as any).mockResolvedValue({ id: "l1" });
    expect(await toggleArticleLike("u1", "a1")).toEqual({ liked: false });
  });
});

describe("getArticleLikes", () => {
  it("returns count with userHasLiked=false for anon", async () => {
    (db.like.count as any).mockResolvedValue(5);
    expect(await getArticleLikes("a1")).toEqual({ count: 5, userHasLiked: false });
  });

  it("returns userHasLiked=true when user liked", async () => {
    (db.like.count as any).mockResolvedValue(3);
    (db.like.findUnique as any).mockResolvedValue({ id: "l1" });
    expect((await getArticleLikes("a1", "u1")).userHasLiked).toBe(true);
  });

  it("returns userHasLiked=false when user has not liked", async () => {
    (db.like.count as any).mockResolvedValue(3);
    (db.like.findUnique as any).mockResolvedValue(null);
    expect((await getArticleLikes("a1", "u1")).userHasLiked).toBe(false);
  });
});

describe("searchArticles", () => {
  it("uses OR insensitive search on title and description", async () => {
    (db.article.findMany as any).mockResolvedValue([]);
    await searchArticles("chemise");
    const w = (db.article.findMany as any).mock.calls[0][0].where;
    expect(w.OR[0].title.mode).toBe("insensitive");
    expect(w.OR[1].description.contains).toBe("chemise");
  });
});

describe("getFeaturedArticles", () => {
  it("limits to 8 available articles", async () => {
    (db.article.findMany as any).mockResolvedValue([]);
    await getFeaturedArticles();
    const c = (db.article.findMany as any).mock.calls[0][0];
    expect(c.take).toBe(8);
    expect(c.where.isAvailable).toBe(true);
  });
});
