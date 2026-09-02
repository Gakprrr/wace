import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { db } from "@/db";

export async function generate2FASecret(userEmail: string) {
  const secret = speakeasy.generateSecret({
    name: `WACE:${userEmail}`,
    length: 20,
    issuer: "WACE — Wear The Energy",
  });

  if (!secret.otpauth_url) {
    throw new Error("Failed to generate OTP auth URL");
  }

  const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);
  return {
    secret: secret.base32,
    qrCode: qrCodeDataUrl,
  };
}

export function verify2FAToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 2, // Tolerance of +/- 2 time intervals (60 seconds)
  });
}

export async function save2FASecret(userId: string, secret: string) {
  return db.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: secret,
      // We don't enable it yet, the user must verify a token first!
    },
  });
}

export async function confirm2FA(userId: string) {
  return db.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
    },
  });
}

export async function disable2FA(userId: string) {
  return db.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });
}
