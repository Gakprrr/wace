import { describe, it, expect, vi, beforeEach } from 'vitest';
/**
 * Unit tests — utils/sms.ts
 */
import { Role, ItemState } from "@prisma/client";

vi.mock("@/db", () => ({
  db: {
    user: { findMany: vi.fn() },
  },
}));
vi.mock("@/utils/webpush", () => ({
  sendPushToAll: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/utils/email", () => ({
  sendNewArticleEmail: vi.fn().mockResolvedValue(undefined),
}));

import { db } from "@/db";
import { sendPushToAll } from "@/utils/webpush";
import { sendNewArticleEmail } from "@/utils/email";
import { sendSMSToAll, notifyNewStock } from "@/utils/sms";

const makeArticle = () => ({
  id: "a1",
  title: "Nike Air Max",
  description: "Baskets top",
  price: 15000,
  oldPrice: null,
  stock: 1,
  state: ItemState.BON_ETAT,
  images: [],
  categoryId: "c1",
  isAvailable: true,
  isNew: true,
  views: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// ─────────────────────────────────────────────────────────────────────────────

describe("sendSMSToAll", () => {
  beforeEach(() => {
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_PHONE_NUMBER;
  });

  it("logs mock message when Twilio not configured", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    await sendSMSToAll("Test broadcast");
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("[SMS MOCK]"));
    spy.mockRestore();
  });

  it("returns undefined early when no credentials", async () => {
    const result = await sendSMSToAll("No creds");
    expect(result).toBeUndefined();
    expect(db.user.findMany).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("notifyNewStock", () => {
  it("calls push, email and SMS in parallel via Promise.allSettled", async () => {
    (db.user.findMany as any).mockResolvedValue([
      { id: "u1", email: "c@c.com", name: "Client", password: null, phone: "+229001", avatar: null,
        role: Role.CLIENT, emailVerified: null, twoFactorEnabled: false, twoFactorSecret: null,
        isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ]);

    await notifyNewStock(makeArticle() as never);

    expect(sendPushToAll).toHaveBeenCalledWith(
      "Nouveau sur WACE !",
      "Nike Air Max",
      "/articles/a1"
    );
    expect(sendNewArticleEmail).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ email: "c@c.com" })]),
      expect.objectContaining({ title: "Nike Air Max" })
    );
  });

  it("fetches clients for email notification", async () => {
    (db.user.findMany as any).mockResolvedValue([]);
    await notifyNewStock(makeArticle() as never);
    expect(db.user.findMany).toHaveBeenCalledWith({ where: { role: Role.CLIENT } });
  });

  it("does not throw if one channel fails (Promise.allSettled)", async () => {
    (db.user.findMany as any).mockResolvedValue([]);
    (sendPushToAll as any).mockRejectedValueOnce(new Error("Push failed"));
    await expect(notifyNewStock(makeArticle() as never)).resolves.not.toThrow();
  });
});
