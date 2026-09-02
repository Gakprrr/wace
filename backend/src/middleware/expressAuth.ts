import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/services/auth.service";
import { Role } from "@prisma/client";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    name?: string | null;
  };
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | null = null;

  // 1. Try Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // 2. Try cookie
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(";").map((c) => c.trim());
    const tokenCookie = cookies.find((c) => c.startsWith("token="));
    if (tokenCookie) {
      token = tokenCookie.substring(6);
    }
  }

  if (token) {
    try {
      const payload = await verifyToken(token);
      if (payload) {
        req.user = {
          id: payload.id as string,
          email: payload.email as string,
          role: payload.role as Role,
          name: payload.name as string | null,
        };
      }
    } catch {
      // Invalid token, leave req.user undefined
    }
  }

  next();
}

export function requireAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Non autorisé" });
    return;
  }
  next();
}

export function requireAdminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Non autorisé" });
    return;
  }
  if (req.user.role !== Role.ADMIN) {
    res.status(403).json({ error: "Accès refusé - Droits d'administration requis" });
    return;
  }
  next();
}
