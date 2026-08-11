import { NextResponse } from "next/server";
import { requireAuth } from "@/backend/utils/auth";
import { findUserById } from "@/backend/services/auth.service";
import { generate2FASecret, save2FASecret } from "@/backend/services/twoFactor";

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    const dbUser = await findUserById(user.userId);

    if (!dbUser) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (dbUser.twoFactorEnabled) {
      return NextResponse.json({ error: "La 2FA est déjà activée" }, { status: 400 });
    }

    const { secret, qrCode } = await generate2FASecret(dbUser.email);

    // Save secret to DB (not yet enabled until verified)
    await save2FASecret(user.userId, secret);

    return NextResponse.json({ secret, qrCode });
  } catch (error: any) {
    console.error("2FA setup error:", error);
    const status = error.message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status });
  }
}
