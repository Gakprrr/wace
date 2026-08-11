import { NextResponse } from "next/server";
import { broadcastNotification } from "@/backend/services/notification.service";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";
import { redis } from "@/backend/redis";
import { NotificationType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const { title, message, type, payload } = await request.json();

    if (!title || !message) {
      return NextResponse.json({ error: "title et message sont requis" }, { status: 400 });
    }

    const notifType = (type as NotificationType) || NotificationType.SYSTEM;

    const notifications = await broadcastNotification({
      title,
      message,
      type: notifType,
      payload,
    });

    // Publish to Redis channel for real-time SSE propagation
    try {
      await redis.publish(
        "notifications:all",
        JSON.stringify({
          event: "broadcast",
          title,
          message,
          type: notifType,
          payload,
          createdAt: new Date().toISOString(),
        })
      );
    } catch (redisErr) {
      console.warn("Failed to publish notification to Redis:", redisErr);
    }

    return NextResponse.json({
      message: "Notification diffusée avec succès",
      count: notifications.length,
    });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
