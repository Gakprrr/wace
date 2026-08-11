import { NextResponse } from "next/server";
import { requireAuth } from "@/backend/utils/auth";
import { findUserById } from "@/backend/services/auth.service";
import { verify2FAToken, disable2FA } from "@/backend/services/twoFactor";

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Le code TOTP actuel est requis pour désactiver la 2FA" },
        { status: 400 }
      );
    }

    // Fetch the current TOTP secret from DB
    const dbUser = await findUserById(user.userId);
    if (!dbUser || !dbUser.twoFactorSecret || !dbUser.twoFactorEnabled) {
      return NextResponse.json({ error: "La 2FA n'est pas activée sur ce compte" }, { status: 400 });
    }

    // Verify the TOTP code before disabling
    const isValid = verify2FAToken(dbUser.twoFactorSecret, token);
    if (!isValid) {
      return NextResponse.json({ error: "Code TOTP invalide" }, { status: 401 });
    }

    await disable2FA(user.userId);
    return NextResponse.json({ message: "2FA désactivée avec succès" });
  } catch (error: any) {
    console.error("2FA disable error:", error);
    const status = error.message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status });
  }
}
