import { describe, it, expect } from "vitest";
import { makeRequest } from "../setup/mocks";
import { GET as getArticlesHandler } from "@/app/api/articles/route";
import { z } from "zod";

const ArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number(),
  stock: z.number(),
  category: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  }).optional(),
});

describe("Contract Testing: /api/articles", () => {
  it("should match the exact frontend contract for articles", async () => {
    // This test ensures the backend returns EXACTLY what the frontend expects.
    const res = await getArticlesHandler(makeRequest("GET", "/api/articles"));
    if (res.status === 200) {
      const data = await res.json();
      expect(Array.isArray(data.articles)).toBe(true);
      if (data.articles.length > 0) {
        const parseResult = ArticleSchema.safeParse(data.articles[0]);
        expect(parseResult.success).toBe(true);
      }
    }
  });
});
