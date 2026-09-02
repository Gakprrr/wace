import { describe, it, expect, vi } from 'vitest';
/**
 * Unit tests — stats.service.ts
 */
import { makeArticle } from "../../setup/mocks";

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

import { getGlobalStats, getArticleStats, getUserStats, exportCatalogue } from "@/services/stats.service";

describe("getGlobalStats", () => {
  it("aggregates all stats", async () => {
    (db.article.count as any).mockResolvedValue(10);
    (db.user.count as any).mockResolvedValueOnce(5).mockResolvedValueOnce(2);
    (db.article.aggregate as any).mockResolvedValue({ _sum: { views: 250 } });
    (db.like.count as any).mockResolvedValue(30);
    (db.comment.count as any).mockResolvedValue(15);

    const s = await getGlobalStats();
    expect(s).toEqual({ totalArticles: 10, totalUsers: 5, totalViews: 250, totalLikes: 30, totalComments: 15, newUsersToday: 2 });
  });

      { createdAt: new Date("2025-06-11T09:00:00Z") },
    ]);
    const s = await getUserStats();
    expect(s.registrationsByDay["2025-06-10"]).toBe(2);
    expect(s.registrationsByDay["2025-06-11"]).toBe(1);
  });
});

describe("exportCatalogue", () => {
  it("produces valid CSV with header row", async () => {
    (db.article.findMany as any).mockResolvedValue([{
      ...makeArticle(),
      price: { toString: () => "3500" },
      oldPrice: null,
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      category: { name: "Vêtements Homme" },
    }]);
    const csv = await exportCatalogue();
    const [header, row] = csv.split("\n");
    expect(header).toBe("ID,Title,Description,Price,OldPrice,Stock,State,Category,Available,New,Views,CreatedAt");
    expect(row).toContain("article-1");
    expect(row).toContain("3500");
    expect(row).toContain("Vêtements Homme");
  });

  it("escapes double quotes in text fields", async () => {
    (db.article.findMany as any).mockResolvedValue([{
      ...makeArticle({ title: 'Title "quoted"', description: 'Desc "val"' }),
      price: { toString: () => "1000" },
      oldPrice: null,
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      category: { name: "Cat" },
    }]);
    const csv = await exportCatalogue();
    expect(csv).toContain('""quoted""');
  });

  it("only header when empty catalogue", async () => {
    (db.article.findMany as any).mockResolvedValue([]);
    const csv = await exportCatalogue();
    expect(csv.split("\n")).toHaveLength(1);
  });
});
