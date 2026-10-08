import { Router } from "express";
import { registerUser, findUserByEmail, comparePassword, generateToken } from "@/services/auth.service";
import { generate2FASecret, verify2FAToken } from "@/services/twoFactor";
import { AuthenticatedRequest, requireAuthMiddleware } from "@/middleware/expressAuth";
import { expressRateLimit } from "@/middleware/rateLimit";
import { errorResponse, ValidationError, UnauthorizedError } from "@/utils/auth";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

const router = Router();

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: JWT_SECRET or NEXTAUTH_SECRET is not configured in environment variables!");
    }
    return "dev_secret_key_change_me_in_production";
  }
  return secret;
}

const authRateLimiter = expressRateLimit(30, 60);

// POST /api/auth/register
router.post("/register", authRateLimiter, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!email || !password) {
      throw new ValidationError("Email et mot de passe requis");
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      throw new ValidationError("Un compte existe déjà avec cet email");
    }

    const user = await registerUser({ name, email, password, phone });
    
    // Generate JWT token
    const token = await generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.status(201).json({ user, token });
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// POST /api/auth/login
router.post("/login", authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ValidationError("Email et mot de passe requis");
    }

    const user = await findUserByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedError("Email ou mot de passe incorrect");
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError("Email ou mot de passe incorrect");
    }

    if (user.twoFactorEnabled) {
      res.json({ requireTwoFactor: true, userId: user.id });
      return;
    }

    const token = await generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.json({ user, token });
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// POST /api/auth/google
router.post("/google", async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      throw new ValidationError("Email Google obligatoire");
    }

    const cleanEmail = email.trim().toLowerCase();
    let user: any = await findUserByEmail(cleanEmail);

    if (!user) {
      user = await registerUser({
        email: cleanEmail,
        name: name || cleanEmail.split("@")[0],
        role: Role.CLIENT,
      });
    }

    if (!user) {
      throw new ValidationError("Impossible de traiter la connexion Google");
    }

    const token = await generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({ user, token });
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// GET /api/auth/session
router.get("/session", (req: AuthenticatedRequest, res) => {
  if (req.user) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false, user: null });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", { path: "/", sameSite: "lax" });
  res.json({ success: true, message: "Déconnexion réussie" });
});

// POST /api/auth/2fa
router.post("/2fa", authRateLimiter, requireAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { action, token } = req.body;
    const userId = req.user!.id;

    if (action === "generate") {
      const secretData = await generate2FASecret(userId);
      res.json(secretData);
    } else if (action === "verify") {
      const isValid = await verify2FAToken(userId, token);
      res.json({ success: isValid });
    } else {
      res.status(400).json({ error: "Action non valide" });
    }
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

export default router;
