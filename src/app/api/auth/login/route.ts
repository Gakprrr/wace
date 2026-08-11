import { NextResponse } from "next/server";
import { findUserByEmail, comparePassword, generateToken } from "@/backend/services/auth.service";
import { withRateLimit } from "@/backend/middleware/rateLimit";

export async function POST(request: Request) {
  try {
    // Rate limit: 5 attempts per 60 seconds per IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const limited = await withRateLimit(request, `login:${ip}`, 5, 60);
    if (limited) return limited;

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user || !user.password) {
      return NextResponse.json({ error: "Email ou mot de passe invalide" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Ce compte a été suspendu par un administrateur." }, { status: 403 });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Email ou mot de passe invalide" }, { status: 401 });
    }

    // If 2FA is enabled, return a short-lived temp token (10 min) without 2FA verified flag
    if (user.twoFactorEnabled) {
      const tempToken = await generateToken(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          twoFactorVerified: false,
        },
        "10m" // Short TTL — user must complete 2FA within 10 minutes
      );

      return NextResponse.json({
        requires2FA: true,
        tempToken,
        user: { id: user.id, email: user.email, name: user.name },
      });
    }

    // Generate full token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      twoFactorVerified: true,
    });

    const response = NextResponse.json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status: 500 });
  }
}
