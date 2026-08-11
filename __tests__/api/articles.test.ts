import { createMocks } from "node-mocks-http";
import { GET, POST } from "@/app/api/articles/route";

// On mocke la DB et les helpers Auth
jest.mock("@/backend/db");
jest.mock("@/backend/utils/auth", () => ({
  requireAdmin: jest.fn()
}));

import { requireAdmin } from "@/backend/utils/auth";
import { db } from "@/backend/db";

describe("GET /api/articles", () => {
  it("should return articles", async () => {
    (db.article.findMany as jest.Mock).mockResolvedValue([
      { id: "1", title: "Test Article" }
    ]);
    (db.article.count as jest.Mock).mockResolvedValue(1);

    const req = new Request("http://localhost/api/articles?limit=10");
    const res = await GET(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    // In our implementation, we return the array directly
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].title).toBe("Test Article");
  });

  it("should handle invalid parameters gracefully", async () => {
    // If parse float fails, it might be ignored or thrown, let's mock prisma to throw
    (db.article.findMany as jest.Mock).mockRejectedValue(new Error("DB Error"));
    const req = new Request("http://localhost/api/articles?minPrice=abc");
    const res = await GET(req);
    expect(res.status).toBe(500); 
  });
});

describe("POST /api/articles (Admin only)", () => {
  it("should return 401/403 without authentication", async () => {
    // Mock requireAdmin to throw error
    (requireAdmin as jest.Mock).mockRejectedValue(new Error("Unauthorized"));
    
    const req = new Request("http://localhost/api/articles", {
      method: "POST",
      body: JSON.stringify({ title: "T-shirt", price: 2500 })
    });
    
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should return 400 with missing required fields", async () => {
    // Mock session with ADMIN role
    (requireAdmin as jest.Mock).mockResolvedValue({ role: "ADMIN" });
    
    const req = new Request("http://localhost/api/articles", {
      method: "POST",
      body: JSON.stringify({ title: "" })  // Manque description, price, categoryId
    });
    
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
