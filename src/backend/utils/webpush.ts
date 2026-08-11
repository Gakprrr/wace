import webpush from "web-push";
import { db } from "@/backend/db";

// Initialise VAPID details lazily at first use to avoid crashing at boot
let vapidInitialized = false;

function ensureVapidInitialized() {
  if (vapidInitialized) return true;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    console.warn("VAPID keys not configured. Web Push is disabled.");
    return false;
  }

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || "mailto:admin@wace.com",
    publicKey,
    privateKey
  );
  vapidInitialized = true;
  return true;
}

/**
 * Send a push notification to all subscribers stored in the database.
 * Automatically removes expired/invalid subscriptions (HTTP 404 / 410).
 */
export async function sendPushToAll(title: string, message: string, url?: string) {
  if (!ensureVapidInitialized()) return;

  const subscriptions = await db.pushSubscription.findMany();
  const payload = JSON.stringify({ title, message, url });

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        const parsedSub = JSON.parse(sub.subscription);
        await webpush.sendNotification(parsedSub, payload);
      } catch (err: any) {
        // Remove expired or gone subscriptions (410 Gone / 404 Not Found)
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await db.pushSubscription.delete({ where: { id: sub.id } }).catch(() => null);
        }
      }
    })
  );
}

/**
 * Send a push notification to a single user's subscriptions.
 */
export async function sendPushToUser(userId: string, title: string, message: string, url?: string) {
  if (!ensureVapidInitialized()) return;

  const subscriptions = await db.pushSubscription.findMany({ where: { userId } });
  const payload = JSON.stringify({ title, message, url });

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        const parsedSub = JSON.parse(sub.subscription);
        await webpush.sendNotification(parsedSub, payload);
      } catch (err: any) {
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await db.pushSubscription.delete({ where: { id: sub.id } }).catch(() => null);
        }
      }
    })
  );
}
