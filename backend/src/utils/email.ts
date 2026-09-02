import nodemailer from "nodemailer";
import { User, Article } from "@prisma/client";

/**
 * Lazy email transporter — reads env vars at call time, not at module load.
 * Supports two env-var conventions:
 *   - SMTP_USER / SMTP_PASS  (generic SMTP, used by notification.service)
 *   - GMAIL_USER / GMAIL_APP_PASSWORD  (Gmail shorthand, docker-compose default)
 * Returns null and logs a warning when no credentials are available.
 */
function getTransporter() {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn("Email credentials not configured (SMTP_USER/SMTP_PASS or GMAIL_USER/GMAIL_APP_PASSWORD). Email will be simulated.");
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

export async function sendNewArticleEmail(users: User[], article: Article) {
  const transporter = getTransporter();
  if (!transporter || users.length === 0) {
    console.log(`[EMAIL MOCK] sendNewArticleEmail — ${users.length} recipients, article: ${article.title}`);
    return;
  }

  const fromAddress = process.env.SMTP_USER || process.env.GMAIL_USER;
  const emailList = users.map((u) => u.email);

  const imagesHtml =
    article.images && article.images.length > 0
      ? `<img src="${article.images[0]}" style="max-width:300px; border-radius:8px" />`
      : "";

  await transporter.sendMail({
    from: `"WACE — Wear The Energy" <${fromAddress}>`,
    bcc: emailList.join(","),
    subject: `🆕 Nouvel article : ${article.title}`,
    html: `
      <div style="background:#1A1A18; color:#F5F0E8; padding:32px; font-family:Arial">
        <h1 style="color:#C8A96E">WACE — Wear The Energy</h1>
        <h2>${article.title}</h2>
        ${imagesHtml}
        <p>${article.description}</p>
        <p style="font-size:24px; color:#C8A96E; font-weight:bold">
          ${Number(article.price).toLocaleString()} FCFA
        </p>
        <a href="https://wace.store/articles/${article.id}"
           style="background:#C8A96E; color:#1A1A18; padding:12px 24px;
                  border-radius:4px; text-decoration:none; font-weight:bold">
          Voir l'article →
        </a>
      </div>
    `,
  });
}
