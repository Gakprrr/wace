import { db } from "@/backend/db";
import { Article, Role } from "@prisma/client";
import { sendPushToAll } from "./webpush";
import { sendNewArticleEmail } from "./email";

/**
 * Lazy Twilio client — only instantiated when credentials are present.
 * Avoids crashing the server at boot if Twilio is not configured.
 */
function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    console.warn("Twilio credentials not configured. SMS will be simulated.");
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const twilio = require("twilio");
    return twilio(sid, token);
  } catch {
    console.warn("Twilio SDK could not be loaded.");
    return null;
  }
}

export async function sendSMSToAll(message: string) {
  const client = getTwilioClient();
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!client || !from) {
    console.log(`[SMS MOCK] Broadcast: ${message}`);
    return;
  }

  const users = await db.user.findMany({
    where: { phone: { not: null }, role: Role.CLIENT },
  });

  return Promise.allSettled(
    users.map((user) =>
      client.messages.create({
        body: `WACE | ${message}`,
        from,
        to: user.phone!,
      })
    )
  );
}

/**
 * Orchestrates all notification channels when a new article is published.
 * Uses Promise.allSettled so a failure in one channel does not block the others.
 */
export async function notifyNewStock(article: Article) {
  const message = `Nouvel article dispo : ${article.title} — ${Number(article.price)} FCFA.\nVoir sur wace.store/articles/${article.id}`;

  const clients = await db.user.findMany({ where: { role: Role.CLIENT } });

  await Promise.allSettled([
    sendPushToAll("Nouveau sur WACE !", article.title, `/catalogue/${article.id}`),
    sendNewArticleEmail(clients, article),
    sendSMSToAll(message),
  ]);
}
