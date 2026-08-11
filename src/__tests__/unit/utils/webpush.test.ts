import { describe, it, expect, vi, beforeEach } from 'vitest';
/**
 * Unit tests — utils/webpush.ts
 *
 * NOTE: vapidInitialized is a module-level boolean that persists across tests
 * within the same file. Tests that need it "uninitialized" must run before any
 * VAPID env vars are set, OR we accept the initialized state and test behavior.
 */
vi.mock("web-push", () => ({
  setVapidDetails: vi.fn(),
  sendNotification: vi.fn(),
}));
vi.mock("@/backend/db", () => ({
  db: {
    pushSubscription: {
      findMany: vi.fn(),
      delete: vi.fn().mockResolvedValue({}),
    },
  },
}));

const db = new Proxy({}, {
  get(target, prop) {
    return require("@/backend/db").db[prop];
  }
}) as any;
import webpush from "web-push";
import { sendPushToAll, sendPushToUser } from "@/backend/utils/webpush";

const validSub = { endpoint: "https://fcm.example.com/1", keys: { auth: "a", p256dh: "b" } };

// ─────────────────────────────────────────────────────────────────────────────

describe("sendPushToAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when VAPID keys not configured (module not yet initialized)", async () => {
    // Clear VAPID keys and reset module so vapidInitialized resets to false
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    vi.resetModules();

    // Re-require after module reset
    const { sendPushToAll: freshSendPushToAll } = await import("@/backend/utils/webpush");
    (db.pushSubscription.findMany as any).mockClear();

    await freshSendPushToAll("T", "M");
    expect(db.pushSubscription.findMany).not.toHaveBeenCalled();
  });

  it("sends to all subscriptions when VAPID configured", async () => {
    process.env.VAPID_PUBLIC_KEY = "pubkey";
    process.env.VAPID_PRIVATE_KEY = "privkey";
    vi.resetModules();
    const { sendPushToAll: freshSend } = await import("@/backend/utils/webpush");
    const freshWebpush = (await import("web-push")) as unknown as { sendNotification: any };
    (freshWebpush.sendNotification as any).mockResolvedValue({});
    (db.pushSubscription.findMany as any).mockResolvedValue([
      { id: "ps1", userId: "u1", subscription: JSON.stringify(validSub) },
      { id: "ps2", userId: "u2", subscription: JSON.stringify(validSub) },
    ]);

    await freshSend("Nouveau", "Article dispo");
    expect(freshWebpush.sendNotification).toHaveBeenCalledTimes(2);
  });

  it("deletes subscription on 410 Gone error", async () => {
    process.env.VAPID_PUBLIC_KEY = "pubkey";
    process.env.VAPID_PRIVATE_KEY = "privkey";
    vi.resetModules();
    const { sendPushToAll: freshSend } = await import("@/backend/utils/webpush");
    const freshWebpush = (await import("web-push")) as unknown as { sendNotification: any };
    const err = Object.assign(new Error("Gone"), { statusCode: 410 });
    (freshWebpush.sendNotification as any).mockRejectedValue(err);
    (db.pushSubscription.findMany as any).mockResolvedValue([
      { id: "ps-gone", userId: "u1", subscription: JSON.stringify(validSub) },
    ]);
    (db.pushSubscription.delete as any).mockResolvedValue({});

    await freshSend("T", "M");
    expect(db.pushSubscription.delete).toHaveBeenCalledWith({ where: { id: "ps-gone" } });
  });

  it("deletes subscription on 404 Not Found error", async () => {
    process.env.VAPID_PUBLIC_KEY = "pubkey";
    process.env.VAPID_PRIVATE_KEY = "privkey";
    vi.resetModules();
    const { sendPushToAll: freshSend } = await import("@/backend/utils/webpush");
    const freshWebpush = (await import("web-push")) as unknown as { sendNotification: any };
    const err = Object.assign(new Error("Not Found"), { statusCode: 404 });
    (freshWebpush.sendNotification as any).mockRejectedValue(err);
    (db.pushSubscription.findMany as any).mockResolvedValue([
      { id: "ps-nf", userId: "u1", subscription: JSON.stringify(validSub) },
    ]);
    (db.pushSubscription.delete as any).mockResolvedValue({});

    await freshSend("T", "M");
    expect(db.pushSubscription.delete).toHaveBeenCalledWith({ where: { id: "ps-nf" } });
  });

  it("does NOT delete subscription on non-410/404 errors", async () => {
    process.env.VAPID_PUBLIC_KEY = "pubkey";
    process.env.VAPID_PRIVATE_KEY = "privkey";
    vi.resetModules();
    const { sendPushToAll: freshSend } = await import("@/backend/utils/webpush");
    const freshWebpush = (await import("web-push")) as unknown as { sendNotification: any };
    const err = Object.assign(new Error("Internal"), { statusCode: 500 });
    (freshWebpush.sendNotification as any).mockRejectedValue(err);
    (db.pushSubscription.findMany as any).mockResolvedValue([
      { id: "ps-err", userId: "u1", subscription: JSON.stringify(validSub) },
    ]);
    (db.pushSubscription.delete as any).mockClear();

    await freshSend("T", "M");
    expect(db.pushSubscription.delete).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("sendPushToUser", () => {
  it("does nothing when VAPID keys not configured", async () => {
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    vi.resetModules();
    const { sendPushToUser: freshSend } = await import("@/backend/utils/webpush");
    const freshWebpush = (await import("web-push")) as unknown as { sendNotification: any };
    (freshWebpush.sendNotification as any).mockClear();

    await freshSend("u1", "T", "M");
    expect(freshWebpush.sendNotification).not.toHaveBeenCalled();
  });

  it("sends only to specified user's subscriptions", async () => {
    process.env.VAPID_PUBLIC_KEY = "pubkey";
    process.env.VAPID_PRIVATE_KEY = "privkey";
    vi.resetModules();
    const { sendPushToUser: freshSend } = await import("@/backend/utils/webpush");
    const freshWebpush = (await import("web-push")) as unknown as { sendNotification: any };
    (freshWebpush.sendNotification as any).mockResolvedValue({});
    (db.pushSubscription.findMany as any).mockResolvedValue([
      { id: "ps1", userId: "u1", subscription: JSON.stringify(validSub) },
    ]);

    await freshSend("u1", "T", "M", "/path");
    expect(db.pushSubscription.findMany).toHaveBeenCalledWith({ where: { userId: "u1" } });
    expect(freshWebpush.sendNotification).toHaveBeenCalledTimes(1);
    const payload = JSON.parse((freshWebpush.sendNotification as any).mock.calls[0][1] as string);
    expect(payload.url).toBe("/path");
  });
});
