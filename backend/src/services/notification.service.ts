import { db } from "@/db";
import { NotificationType } from "@prisma/client";
import nodemailer from "nodemailer";

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
        data: data.payload ?? null,
      },
    })
  );

  return db.$transaction(notifications);
}

export async function getUserNotifications(userId: string) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationAsRead(notificationId: string) {
  return db.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

// --- Email (Nodemailer / Gmail SMTP) ---

/**
 * Lazy transporter — supports both SMTP_USER/SMTP_PASS and GMAIL_USER/GMAIL_APP_PASSWORD.
 * Never throws at module load time.
 */
function getEmailTransporter() {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn("Email credentials not configured. Email will be simulated.");
    return null;
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendEmail(to: string | string[], subject: string, html: string) {
  const transporter = getEmailTransporter();
  if (!transporter) {
    console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
    return { messageId: "mock-" + Date.now(), mocked: true };
  }

  const fromAddress = process.env.SMTP_USER || process.env.GMAIL_USER;
  const recipients = Array.isArray(to) ? to.join(",") : to;

  return transporter.sendMail({
    from: `"WACE — Wear The Energy" <${fromAddress}>`,
    to: recipients,
    subject,
    html,
  });
}

export async function sendBulkEmail(subject: string, html: string) {
  // email is non-nullable in the schema; filter is here for defensive safety
  const users = await db.user.findMany({
    where: { role: "CLIENT" },
    select: { email: true },
  });

  const emails = users.map((u) => u.email);
  return sendEmail(emails, subject, html);
}

// --- SMS (Twilio) ---

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    console.warn("Twilio credentials not configured. SMS will be simulated.");
    return null;
  }

  // Dynamic import to avoid crashes when twilio is not configured
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const twilio = require("twilio");
    return twilio(sid, token);
  } catch {
    console.warn("Twilio SDK could not be loaded.");
    return null;
  }
}

export async function sendSMS(to: string, body: string) {
  const client = getTwilioClient();
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!client || !from) {
    console.log(`[SMS MOCK] To: ${to}, Body: ${body}`);
    return { sid: "mock-" + Date.now(), mocked: true };
  }

  return client.messages.create({ body, from, to });
}

export async function sendBulkSMS(body: string) {
  const users = await db.user.findMany({
    where: { role: "CLIENT", phone: { not: null } },
    select: { phone: true },
  });

  const results = [];
  for (const u of users) {
    if (u.phone) {
      results.push(await sendSMS(u.phone, body));
    }
  }
  return results;
}

// --- Web Push ---

export function getWebPushConfig() {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || "mailto:admin@wace.tg";

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn("VAPID keys not configured. Web Push is disabled.");
    return null;
  }

  return { vapidPublicKey, vapidPrivateKey, vapidEmail };
}
