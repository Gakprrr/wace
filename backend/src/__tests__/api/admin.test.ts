/**
 * API Route tests — /api/admin/*
 * Covers: users, contacts, stats, export, notifications, upload
 */
import { describe, it, expect, vi } from "vitest";
import { Role } from "@prisma/client";
import { makeUser, makeAdmin, makeContact, makeNotification, makeRequest } from "../setup/mocks";
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
vi.mock("@/redis", () => ({
  redis: {
    publish: vi.fn().mockResolvedValue(1),
    smembers: vi.fn().mockResolvedValue([]),
    on: vi.fn(),
  },
  redisSub: { on: vi.fn(), subscribe: vi.fn() },
}));
vi.mock("web-push", () => ({ setVapidDetails: vi.fn(), sendNotification: vi.fn().mockResolvedValue({}) }));
vi.mock("nodemailer", () => ({
  createTransport: vi.fn().mockReturnValue({ sendMail: vi.fn().mockResolvedValue({ messageId: "mock" }) }),
}));

import { db } from "@/db";

import { GET as listUsersHandler } from "@/app/api/admin/users/route";
import { GET as getUserHandler, DELETE as deleteUserHandler } from "@/app/api/admin/users/[id]/route";
import { PUT as banHandler } from "@/app/api/admin/users/[id]/ban/route";
import { GET as statsHandler } from "@/app/api/admin/stats/route";
import { GET as articleStatsHandler } from "@/app/api/admin/stats/articles/route";
import { GET as userStatsHandler } from "@/app/api/admin/stats/users/route";
import { GET as exportHandler } from "@/app/api/admin/export/catalogue/route";
import { GET as listContactsHandler, POST as createContactHandler } from "@/app/api/admin/contacts/route";
import { PUT as updateContactHandler, DELETE as deleteContactHandler } from "@/app/api/admin/contacts/[id]/route";
import { PUT as toggleContactHandler } from "@/app/api/admin/contacts/[id]/toggle/route";
import { PUT as reorderHandler } from "@/app/api/admin/contacts/reorder/route";
import { POST as broadcastHandler } from "@/app/api/admin/notifications/broadcast/route";
import { POST as emailHandler } from "@/app/api/admin/notifications/email/route";
import { POST as smsHandler } from "@/app/api/admin/notifications/sms/route";
import { POST as pushHandler } from "@/app/api/admin/notifications/push/route";

const params = (id: string) => Promise.resolve({ id });

// Helper tokens
async function adminToken() {
  return generateToken({ userId: "admin-1", email: "admin@wace.com", role: Role.ADMIN });
}
async function clientToken() {
  return generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
}

// ── Users ─────────────────────────────────────────────────────────────────────

describe("GET /api/admin/users", () => {
  it("returns 401 without auth", async () => {
    expect((await listUsersHandler(makeRequest("GET", "/api/admin/users"))).status).toBe(401);
  });

  it("returns 403 for CLIENT", async () => {
    const token = await clientToken();
    expect((await listUsersHandler(makeRequest("GET", "/api/admin/users", { token }))).status).toBe(403);
  });

  it("returns 200 with user list (admin)", async () => {
    const token = await adminToken();
    (db.user.findMany as any).mockResolvedValue([makeUser(), makeAdmin()]);
    const res = await listUsersHandler(makeRequest("GET", "/api/admin/users", { token }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
  });
});

describe("GET /api/admin/users/[id]", () => {
  it("returns 404 for unknown user", async () => {
    const token = await adminToken();
    (db.user.findUnique as any).mockResolvedValue(null);
    const res = await getUserHandler(makeRequest("GET", "/api/admin/users/ghost", { token }), { params: params("ghost") });
    expect(res.status).toBe(404);
  });

  it("returns user without password field", async () => {
    const token = await adminToken();
    (db.user.findUnique as any).mockResolvedValue(makeUser({ password: "hashed!" }));
    const res = await getUserHandler(makeRequest("GET", "/api/admin/users/u1", { token }), { params: params("u1") });
    const body = await res.json();
    expect(body.password).toBeUndefined();
  });
});

describe("DELETE /api/admin/users/[id]", () => {
  it("returns 400 when admin deletes themselves", async () => {
    const token = await generateToken({ userId: "admin-1", email: "a@a.com", role: Role.ADMIN });
    const res = await deleteUserHandler(
      makeRequest("DELETE", "/api/admin/users/admin-1", { token }),
      { params: params("admin-1") }
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/propre compte/);
  });

  it("deletes another user successfully", async () => {
    const token = await generateToken({ userId: "admin-1", email: "a@a.com", role: Role.ADMIN });
    (db.user.delete as any).mockResolvedValue({ id: "u2" });
    const res = await deleteUserHandler(makeRequest("DELETE", "/api/admin/users/u2", { token }), { params: params("u2") });
    expect(res.status).toBe(200);
  });
});

describe("PUT /api/admin/users/[id]/ban", () => {
  it("returns 400 when active field missing", async () => {
    const token = await adminToken();
    const res = await banHandler(makeRequest("PUT", "/api/admin/users/u1/ban", { token, body: {} }), { params: params("u1") });
    expect(res.status).toBe(400);
  });

  it("suspends user (active=false)", async () => {
    const token = await adminToken();
    (db.user.update as any).mockResolvedValue({ id: "u1", email: "u@u.com", name: "User", isActive: false });
    const res = await banHandler(makeRequest("PUT", "/api/admin/users/u1/ban", { token, body: { active: false } }), { params: params("u1") });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/suspendu/i);
  });

  it("reactivates user (active=true)", async () => {
    const token = await adminToken();
    (db.user.update as any).mockResolvedValue({ id: "u1", email: "u@u.com", name: "User", isActive: true });
    const res = await banHandler(makeRequest("PUT", "/api/admin/users/u1/ban", { token, body: { active: true } }), { params: params("u1") });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/réactivé/i);
  });
});

// ── Stats ─────────────────────────────────────────────────────────────────────

describe("GET /api/admin/stats", () => {
  it("returns 401 without auth", async () => {
    expect((await statsHandler(makeRequest("GET", "/api/admin/stats"))).status).toBe(401);
  });

  it("returns global stats for admin", async () => {
    const token = await adminToken();
    (db.article.count as any).mockResolvedValue(10);
    (db.user.count as any).mockResolvedValue(5);
    (db.article.aggregate as any).mockResolvedValue({ _sum: { views: 100 } });
    (db.like.count as any).mockResolvedValue(20);
    (db.comment.count as any).mockResolvedValue(8);
    const res = await statsHandler(makeRequest("GET", "/api/admin/stats", { token }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.totalArticles).toBe(10);
  });
});

describe("GET /api/admin/stats/articles", () => {
  it("returns article stats lists", async () => {
    const token = await adminToken();
    (db.article.findMany as any).mockResolvedValue([]);
    const res = await articleStatsHandler(makeRequest("GET", "/api/admin/stats/articles", { token }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("mostViewed");
    expect(body).toHaveProperty("mostLiked");
    expect(body).toHaveProperty("mostCommented");
  });
});

describe("GET /api/admin/stats/users", () => {
  it("returns user stats", async () => {
    const token = await adminToken();
    (db.user.count as any).mockResolvedValue(50);
    (db.user.findMany as any).mockResolvedValue([]);
    const res = await userStatsHandler(makeRequest("GET", "/api/admin/stats/users", { token }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("totalUsers");
    expect(body).toHaveProperty("registrationsByDay");
  });
});

// ── Export ────────────────────────────────────────────────────────────────────

describe("GET /api/admin/export/catalogue", () => {
  it("returns CSV content-type", async () => {
    const token = await adminToken();
    (db.article.findMany as any).mockResolvedValue([]);
    const res = await exportHandler(makeRequest("GET", "/api/admin/export/catalogue", { token }));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
    expect(res.headers.get("content-disposition")).toContain("attachment");
  });

  it("returns 401 for CLIENT", async () => {
    const token = await clientToken();
    const res = await exportHandler(makeRequest("GET", "/api/admin/export/catalogue", { token }));
    expect(res.status).toBe(403);
  });
});

// ── Contacts ──────────────────────────────────────────────────────────────────

describe("GET /api/admin/contacts", () => {
  it("returns all contacts for admin", async () => {
    const token = await adminToken();
    (db.socialContact.findMany as any).mockResolvedValue([makeContact(), makeContact({ id: "c2", isActive: false })]);
    const res = await listContactsHandler(makeRequest("GET", "/api/admin/contacts", { token }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
  });
});

describe("POST /api/admin/contacts", () => {
  it("returns 400 when required fields missing", async () => {
    const token = await adminToken();
    const res = await createContactHandler(makeRequest("POST", "/api/admin/contacts", { token, body: { platform: "wa" } }));
    expect(res.status).toBe(400);
  });

  it("creates contact (admin)", async () => {
    const token = await adminToken();
    (db.socialContact.create as any).mockResolvedValue(makeContact());
    const res = await createContactHandler(makeRequest("POST", "/api/admin/contacts", {
      token,
      body: { platform: "whatsapp", label: "WA", url: "https://wa.me/1" },
    }));
    expect(res.status).toBe(201);
  });
});

describe("PUT /api/admin/contacts/[id]", () => {
  it("updates contact", async () => {
    const token = await adminToken();
    (db.socialContact.update as any).mockResolvedValue(makeContact({ label: "Updated" }));
    const res = await updateContactHandler(
      makeRequest("PUT", "/api/admin/contacts/c1", { token, body: { label: "Updated" } }),
      { params: params("c1") }
    );
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/admin/contacts/[id]", () => {
  it("deletes contact", async () => {
    const token = await adminToken();
    (db.socialContact.delete as any).mockResolvedValue({ id: "c1" });
    const res = await deleteContactHandler(makeRequest("DELETE", "/api/admin/contacts/c1", { token }), { params: params("c1") });
    expect(res.status).toBe(200);
  });
});

describe("PUT /api/admin/contacts/[id]/toggle", () => {
  it("toggles contact active state", async () => {
    const token = await adminToken();
    (db.socialContact.findUnique as any).mockResolvedValue(makeContact({ isActive: true }));
    (db.socialContact.update as any).mockResolvedValue(makeContact({ isActive: false }));
    const res = await toggleContactHandler(makeRequest("PUT", "/api/admin/contacts/c1/toggle", { token }), { params: params("c1") });
    expect(res.status).toBe(200);
  });
});

describe("PUT /api/admin/contacts/reorder", () => {
  it("returns 400 when orderedIds missing", async () => {
    const token = await adminToken();
    const res = await reorderHandler(makeRequest("PUT", "/api/admin/contacts/reorder", { token, body: {} }));
    expect(res.status).toBe(400);
  });

  it("reorders contacts", async () => {
    const token = await adminToken();
    (db.socialContact.findMany as any).mockResolvedValue([{ id: "c1" }, { id: "c2" }]);
    (db.socialContact.update as any).mockResolvedValue({});
    (db.$transaction as any).mockImplementation((ops: unknown[]) => Promise.all(ops));
    const res = await reorderHandler(makeRequest("PUT", "/api/admin/contacts/reorder", { token, body: { orderedIds: ["c1", "c2"] } }));
    expect(res.status).toBe(200);
  });
});

// ── Notifications ─────────────────────────────────────────────────────────────

describe("POST /api/admin/notifications/broadcast", () => {
  it("returns 400 when title or message missing", async () => {
    const token = await adminToken();
    const res = await broadcastHandler(makeRequest("POST", "/api/admin/notifications/broadcast", { token, body: { title: "T" } }));
    expect(res.status).toBe(400);
  });

  it("broadcasts notification and publishes to Redis", async () => {
    const token = await adminToken();
    (db.user.findMany as any).mockResolvedValue([makeUser()]);
    (db.notification.create as any).mockResolvedValue(makeNotification());
    (db.$transaction as any).mockResolvedValue([makeNotification()]);

    const res = await broadcastHandler(makeRequest("POST", "/api/admin/notifications/broadcast", {
      token,
      body: { title: "Promo !", message: "Nouveau stock disponible" },
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBeDefined();
  });
});

describe("POST /api/admin/notifications/email", () => {
  it("returns 400 when subject or html missing", async () => {
    const token = await adminToken();
    const res = await emailHandler(makeRequest("POST", "/api/admin/notifications/email", { token, body: { subject: "S" } }));
    expect(res.status).toBe(400);
  });

  it("sends email (mocked SMTP)", async () => {
    const token = await adminToken();
    const res = await emailHandler(makeRequest("POST", "/api/admin/notifications/email", {
      token,
      body: { to: "client@wace.com", subject: "Test", html: "<p>Hello</p>" },
    }));
    expect(res.status).toBe(200);
  });
});

describe("POST /api/admin/notifications/sms", () => {
  it("returns 400 when body missing", async () => {
    const token = await adminToken();
    const res = await smsHandler(makeRequest("POST", "/api/admin/notifications/sms", { token, body: {} }));
    expect(res.status).toBe(400);
  });

  it("sends SMS (mocked Twilio)", async () => {
    const token = await adminToken();
    const res = await smsHandler(makeRequest("POST", "/api/admin/notifications/sms", {
      token,
      body: { to: "+22890000001", body: "Nouveau stock !" },
    }));
    expect(res.status).toBe(200);
  });
});

describe("POST /api/admin/notifications/push", () => {
  it("returns 400 when title or body missing", async () => {
    const token = await adminToken();
    const res = await pushHandler(makeRequest("POST", "/api/admin/notifications/push", { token, body: { title: "T" } }));
    expect(res.status).toBe(400);
  });

  it("returns 'no subscribers' message when DB empty", async () => {
    const token = await adminToken();
    (db.pushSubscription.findMany as any).mockResolvedValue([]);
    const res = await pushHandler(makeRequest("POST", "/api/admin/notifications/push", {
      token,
      body: { title: "T", body: "M" },
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/aucun/i);
  });

  it("sends push mock (no VAPID config)", async () => {
    const token = await adminToken();
    (db.pushSubscription.findMany as any).mockResolvedValue([
      { id: "ps1", subscription: JSON.stringify({ endpoint: "https://fcm.example.com/1", keys: { auth: "a", p256dh: "b" } }), userId: "u1" },
    ]);
    // VAPID not set → mock path
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;

    const res = await pushHandler(makeRequest("POST", "/api/admin/notifications/push", {
      token,
      body: { title: "Alerte", body: "Nouveau produit !" },
    }));
    expect(res.status).toBe(200);
    const resBody = await res.json();
    expect(resBody.mocked).toBe(true);
  });
});
