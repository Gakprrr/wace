import { db } from "@/db";
import { NotificationType } from "@prisma/client";

// --- Database Notification Storage ---

export async function createNotification(data: {
  title: string;
  message: string;
  type: NotificationType;
  userId?: string;
  data?: any;
}) {
  return db.notification.create({
    data: {
      title: data.title,
      message: data.message,
      type: data.type,
      userId: data.userId ?? null,
      data: data.data ?? null,
    },
  });
}

export async function getUserNotifications(userId: string) {
  return db.notification.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function subscribePushNotification(userId: string, subscription: any) {
  return db.pushSubscription.create({
    data: {
      userId,
      subscription: typeof subscription === "string" ? subscription : JSON.stringify(subscription),
    },
  });
}

export async function broadcastNotification(data: {
  title: string;
  message: string;
  type: NotificationType;
  payload?: any;
}) {
  // Fetch all client users
  const users = await db.user.findMany({
    where: { role: "CLIENT" },
    select: { id: true },
  });

  const notifications = users.map((u) =>
    db.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type,
        userId: u.id,
      },
    })
  );

  return Promise.all(notifications);
}
