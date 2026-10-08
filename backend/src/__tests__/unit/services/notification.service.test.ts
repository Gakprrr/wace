import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
/**
 * Unit tests — notification.service.ts
 * Covers: createNotification, broadcastNotification, getUserNotifications,
 *         markNotificationAsRead, sendEmail (mock path), sendBulkEmail,
 *         sendSMS (mock path), sendBulkSMS, getWebPushConfig
 */
import { NotificationType } from "@prisma/client";

vi.mock("@/db", () => ({
  db: {
    notification: { create: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    user: { findMany: vi.fn() },
    $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  },
}));
vi.mock("nodemailer", () => ({
  createTransport: vi.fn().mockReturnValue({
    sendMail: vi.fn().mockResolvedValue({ messageId: "real-message-id" }),
  }),
}));

import { db } from "@/db";

import {
  createNotification,
  broadcastNotification,
  getUserNotifications,
  markNotificationAsRead,
  sendEmail,
  sendBulkEmail,
  sendSMS,
  sendBulkSMS,
  getWebPushConfig,
} from "@/services/notification.service";
import { makeNotification, makeUser } from "../../setup/mocks";

// ─────────────────────────────────────────────────────────────────────────────

afterEach(() => {
  vi.clearAllMocks();
});

describe("createNotification", () => {
  it("creates a notification for a specific user", async () => {
    (db.notification.create as any).mockResolvedValue(makeNotification());
    await createNotification({ title: "T", message: "M", type: NotificationType.SYSTEM, userId: "u1" });
    const data = (db.notification.create as any).mock.calls[0][0].data;
    expect(data.userId).toBe("u1");
    expect(data.title).toBe("T");
  });

  it("creates a broadcast notification (userId null)", async () => {
    (db.notification.create as any).mockResolvedValue(makeNotification({ userId: null }));
    await createNotification({ title: "T", message: "M", type: NotificationType.SYSTEM });
    const data = (db.notification.create as any).mock.calls[0][0].data;
    expect(data.userId).toBeNull();
  });
});

describe("broadcastNotification", () => {
  it("creates one notification per client user", async () => {
    (db.user.findMany as any).mockResolvedValue([{ id: "u1" }, { id: "u2" }, { id: "u3" }]);
    (db.notification.create as any).mockResolvedValue(makeNotification());
    (db.$transaction as any).mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops));

    const result = await broadcastNotification({ title: "Promo", message: "Soldes !", type: NotificationType.ARTICLE_ADDED });
    expect(db.notification.create).toHaveBeenCalledTimes(3);
    expect(result).toHaveLength(3);
  });

  it("returns empty array when no clients", async () => {
    (db.user.findMany as any).mockResolvedValue([]);
    (db.$transaction as any).mockResolvedValue([]);
    const result = await broadcastNotification({ title: "T", message: "M", type: NotificationType.SYSTEM });
    expect(result).toHaveLength(0);
  });
});

describe("getUserNotifications", () => {
  it("returns user notifications ordered by date desc", async () => {
    (db.notification.findMany as any).mockResolvedValue([makeNotification(), makeNotification({ id: "n2" })]);
    const result = await getUserNotifications("u1");
    expect(result).toHaveLength(2);
    expect((db.notification.findMany as any).mock.calls[0][0].orderBy).toEqual({ createdAt: "desc" });
  });
});

describe("markNotificationAsRead", () => {
  it("sets isRead=true", async () => {
    (db.notification.update as any).mockResolvedValue({ ...makeNotification(), isRead: true });
    await markNotificationAsRead("n1");
    expect((db.notification.update as any).mock.calls[0][0].data).toEqual({ isRead: true });
  });
});

// ── Email ─────────────────────────────────────────────────────────────────────

describe("sendEmail", () => {
  beforeEach(() => {
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
  });

  it("returns mock result when SMTP not configured", async () => {
    const result = await sendEmail("a@b.com", "Test", "<p>Hi</p>") as Record<string, unknown>;
    expect(result.mocked).toBe(true);
  });

  it("calls nodemailer when SMTP is configured", async () => {
    process.env.SMTP_USER = "user@smtp.com";
    process.env.SMTP_PASS = "pass";
    const nodemailer = await import("nodemailer");
    const mockSendMail = vi.fn().mockResolvedValue({ messageId: "real-id" });
    (nodemailer.createTransport as any).mockReturnValue({ sendMail: mockSendMail });

    const result = await sendEmail("dest@test.com", "Subj", "<p>Body</p>") as Record<string, unknown>;
    expect(mockSendMail).toHaveBeenCalled();
    expect(result.messageId).toBe("real-id");
  });

  it("joins array of recipients into comma-separated string", async () => {
    process.env.SMTP_USER = "u@u.com";
    process.env.SMTP_PASS = "p";
    const nodemailer = await import("nodemailer");
    const mockSendMail = vi.fn().mockResolvedValue({ messageId: "x" });
    (nodemailer.createTransport as any).mockReturnValue({ sendMail: mockSendMail });

    await sendEmail(["a@a.com", "b@b.com"], "S", "<p>B</p>");
    const callArg = mockSendMail.mock.calls[0][0];
    expect(callArg.to).toBe("a@a.com,b@b.com");
  });
});

describe("sendBulkEmail", () => {
  it("fetches all CLIENT emails and sends to them", async () => {
    delete process.env.SMTP_USER;
    (db.user.findMany as any).mockResolvedValue([{ email: "a@a.com" }, { email: "b@b.com" }]);

    const result = await sendBulkEmail("Subject", "<p>Body</p>") as Record<string, unknown>;
    // No SMTP → mock result
    expect(result.mocked).toBe(true);
    expect(db.user.findMany).toHaveBeenCalledWith({ where: { role: "CLIENT" }, select: { email: true } });
  });
});

// ── SMS ───────────────────────────────────────────────────────────────────────

describe("sendSMS", () => {
  it("returns mock result when Twilio not configured", async () => {
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    const result = await sendSMS("+22890000001", "Hello") as Record<string, unknown>;
    expect(result.mocked).toBe(true);
  });
});

describe("sendBulkSMS", () => {
  it("sends SMS to all clients with phone numbers", async () => {
    delete process.env.TWILIO_ACCOUNT_SID;
    (db.user.findMany as any).mockResolvedValue([{ phone: "+22890000001" }, { phone: "+22890000002" }]);

    const results = await sendBulkSMS("Nouveau produit !");
    expect(results).toHaveLength(2);
    // Each should be a mock result
    expect((results[0] as Record<string, unknown>).mocked).toBe(true);
  });

  it("skips users without phone number (null entries filtered)", async () => {
    delete process.env.TWILIO_ACCOUNT_SID;
    (db.user.findMany as any).mockResolvedValue([{ phone: "+22890000001" }, { phone: null }]);

    const results = await sendBulkSMS("Test");
    expect(results).toHaveLength(1);
  });
});

// ── Web Push Config ───────────────────────────────────────────────────────────

describe("getWebPushConfig", () => {
  it("returns null when VAPID keys not configured", () => {
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    expect(getWebPushConfig()).toBeNull();
  });

  it("returns config object when VAPID keys are set", () => {
    process.env.VAPID_PUBLIC_KEY = "public-key";
    process.env.VAPID_PRIVATE_KEY = "private-key";
    process.env.VAPID_EMAIL = "mailto:admin@wace.com";

    const config = getWebPushConfig();
    expect(config).not.toBeNull();
    expect(config?.vapidPublicKey).toBe("public-key");
    expect(config?.vapidPrivateKey).toBe("private-key");
    expect(config?.vapidEmail).toBe("mailto:admin@wace.com");

    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    delete process.env.VAPID_EMAIL;
  });

  it("uses fallback email when VAPID_EMAIL not set", () => {
    process.env.VAPID_PUBLIC_KEY = "pub";
    process.env.VAPID_PRIVATE_KEY = "priv";
    delete process.env.VAPID_EMAIL;

    const config = getWebPushConfig();
    expect(config?.vapidEmail).toBe("mailto:admin@wace.tg");

    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
  });
});
