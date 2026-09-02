import { Router } from "express";
import { register, login, generateTwoFactorSecret, verifyTwoFactorToken } from "@/services/auth.service";
import { AuthenticatedRequest, requireAuthMiddleware } from "@/middleware/expressAuth";
import { errorResponse } from "@/utils/auth";
import jwt from "jsonwebtoken";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const user = await register({ name, email, password, phone });
    
    // Generate JWT token
    const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "fallback_secret";
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/" });
    res.status(201).json({ user, token });
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);

    if (result.requireTwoFactor) {
      res.json({ requireTwoFactor: true, userId: result.userId });
      return;
    }

    const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "fallback_secret";
    const token = jwt.sign(
      { id: result.user!.id, email: result.user!.email, role: result.user!.role, name: result.user!.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/" });
    res.json({ user: result.user, token });
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// GET /api/auth/session
router.get("/session", (req: AuthenticatedRequest, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.json({ success: true, message: "Déconnexion réussie" });
});

// POST /api/auth/2fa
router.post("/2fa", requireAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { action, token } = req.body;
    const userId = req.user!.id;

    if (action === "generate") {
      const secretData = await generateTwoFactorSecret(userId);
      res.json(secretData);
    } else if (action === "verify") {
      const isValid = await verifyTwoFactorToken(userId, token);
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
