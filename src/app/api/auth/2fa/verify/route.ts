import { NextResponse } from "next/server";
import { requireAuth } from "@/backend/utils/auth";
import { findUserById, generateToken } from "@/backend/services/auth.service";
import { verify2FAToken, confirm2FA } from "@/backend/services/twoFactor";

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    const { token } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Code TOTP requis" }, { status: 400 });
    }

    const dbUser = await findUserById(user.userId);
    if (!dbUser || !dbUser.twoFactorSecret) {
      return NextResponse.json({ error: "2FA non configurée" }, { status: 400 });
    }

    const isValid = verify2FAToken(dbUser.twoFactorSecret, token);
    if (!isValid) {
      return NextResponse.json({ error: "Code invalide" }, { status: 401 });
    }

    // If 2FA wasn't enabled yet, enable it now (first-time verification)
    if (!dbUser.twoFactorEnabled) {
      await confirm2FA(user.userId);
    }

    // Issue a new full JWT with twoFactorVerified = true
    const newToken = await generateToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
      twoFactorVerified: true,
    });

    const response = NextResponse.json({ success: true, token: newToken });

    response.cookies.set({
      name: "token",
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("2FA verify error:", error);
    const status = error.message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status });
  }
}
