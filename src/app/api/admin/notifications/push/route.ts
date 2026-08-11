import { NextResponse } from "next/server";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";
import { db } from "@/backend/db";
import { getWebPushConfig } from "@/backend/services/notification.service";
import webpush from "web-push";

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const { userId, title, body, icon, url } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: "title et body sont requis" }, { status: 400 });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || "/favicon.ico",
      url: url || "/",
    });

    // Fetch subscriptions from the database (persistent storage)
    const subscriptionRecords = userId
      ? await db.pushSubscription.findMany({ where: { userId } })
      : await db.pushSubscription.findMany();

    if (subscriptionRecords.length === 0) {
      return NextResponse.json({ message: "Aucun abonné push trouvé" });
    }

    const config = getWebPushConfig();
    if (!config) {
      console.log(`[PUSH MOCK] Sending push to ${subscriptionRecords.length} subscribers. Payload:`, payload);
      return NextResponse.json({
        message: "Web Push simulé (clés VAPID non configurées)",
        count: subscriptionRecords.length,
        mocked: true,
      });
    }

    webpush.setVapidDetails(config.vapidEmail, config.vapidPublicKey, config.vapidPrivateKey);

    let sentCount = 0;
    let failedCount = 0;

    for (const record of subscriptionRecords) {
      try {
        const sub = JSON.parse(record.subscription);
        await webpush.sendNotification(sub, payload);
        sentCount++;
      } catch (err: any) {
        console.warn("Failed to send web push, removing subscription:", err.message);
        failedCount++;
        // Remove expired or gone subscriptions
        if (err.statusCode === 404 || err.statusCode === 410) {
          await db.pushSubscription.delete({ where: { id: record.id } }).catch(() => null);
        }
      }
    }

    return NextResponse.json({
      message: "Notification Push envoyée",
      sentCount,
      failedCount,
    });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
