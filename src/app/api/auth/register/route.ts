import { NextResponse } from "next/server";
import { registerUser, findUserByEmail } from "@/backend/services/auth.service";
import { Role } from "@prisma/client";
import { withRateLimit } from "@/backend/middleware/rateLimit";

export async function POST(request: Request) {
  try {
    // Rate limit: 5 attempts per minute per IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const limited = await withRateLimit(request, `register:${ip}`, 5, 60);
    if (limited) return limited;

    const { email, password, name, phone } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Format d'email invalide" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 400 });
    }

    const user = await registerUser({ email, password, name, phone, role: Role.CLIENT });

    return NextResponse.json({ message: "Inscription réussie", user }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status: 500 });
  }
}
