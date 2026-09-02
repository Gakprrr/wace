import { db } from "@/db";
import { NotificationType, Prisma } from "@prisma/client";
import { sendPushToAll } from "@/utils/webpush";

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
      data: data.data ? (data.data as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  });
}

export async function getUserNotifications(userId: string) {
  return db.notification.findMany({
    where: { OR: [{ userId }, { userId: null }] },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function subscribePushNotification(userId: string, subscription: any) {
  const subString = typeof subscription === "string" ? subscription : JSON.stringify(subscription);
  
  // Éviter les doublons d'abonnements push
  const existing = await db.pushSubscription.findFirst({
    where: { userId, subscription: subString },
  });

  if (existing) {
    return existing;
  }

  return db.pushSubscription.create({
    data: {
      userId,
      subscription: subString,
    },
  });
}

export async function broadcastNotification(data: {
  title: string;
  message: string;
  type: NotificationType;
  payload?: any;
}) {
  // Récupérer tous les comptes clients actifs
  const users = await db.user.findMany({
    where: { role: "CLIENT", isActive: true },
    select: { id: true },
  });

  if (users.length > 0) {
    const notificationData = users.map((u) => ({
      title: data.title,
      message: data.message,
      type: data.type,
      userId: u.id,
      data: data.payload ? (data.payload as Prisma.InputJsonValue) : Prisma.JsonNull,
    }));

    // Insertion groupée optimisée en base de données
    await db.notification.createMany({
      data: notificationData,
    });
  }

  // Déclencher les Web Push Notifications à tous les abonnés
  try {
    await sendPushToAll(data.title, data.message, data.payload?.url || "/");
  } catch (pushErr) {
    console.warn("Échec de la diffusion Web Push:", pushErr);
  }

  return { count: users.length };
}
