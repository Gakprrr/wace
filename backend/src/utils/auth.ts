import { verifyToken } from "@/services/auth.service";
import { Role } from "@prisma/client";

// ── Typed error classes ───────────────────────────────────────────────────────

export class UnauthorizedError extends Error {
  readonly statusCode = 401;
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  readonly statusCode = 403;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  readonly statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

export async function getUserFromRequest(request: Request) {
  let token: string | null = null;

  // 1. Try Authorization header (Bearer token)
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // 2. Try cookies
  if (!token) {
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map((c) => c.trim());
      const tokenCookie = cookies.find((c) => c.startsWith("token="));
      if (tokenCookie) {
        token = tokenCookie.substring(6);
      }
    }
  }

  if (!token) return null;

  return verifyToken(token);
}

export async function requireAuth(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) throw new UnauthorizedError("Unauthorized");
  return user;
}

export async function requireAdmin(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) throw new UnauthorizedError("Unauthorized");
  if (user.role !== Role.ADMIN) throw new ForbiddenError("Forbidden - Admin access required");
  return user;
}

// ── Response helper ───────────────────────────────────────────────────────────

/**
 * Maps typed errors (and Prisma errors) to HTTP status codes.
 * Uses instanceof checks instead of fragile string matching.
 */
export function errorResponse(
  error: unknown,
  fallbackMessage = "Internal server error"
): { error: string; status: number } {
  // Typed application errors
  if (error instanceof UnauthorizedError) return { error: error.message, status: 401 };
  if (error instanceof ForbiddenError) return { error: error.message, status: 403 };
  if (error instanceof NotFoundError) return { error: error.message, status: 404 };
  if (error instanceof ValidationError) return { error: error.message, status: 400 };

  if (error instanceof Error) {
    const msg = error.message;

    // Prisma "Record not found" errors
    if (msg.includes("Record to") && msg.includes("does not exist")) {
      return { error: "Ressource non trouvée", status: 404 };
    }
    // Prisma unique constraint violations
    if (msg.includes("Unique constraint")) {
      return { error: "Cette ressource existe déjà", status: 409 };
    }
    // Prisma foreign-key violations
    if (msg.includes("Foreign key constraint")) {
      return { 
        error: "Action impossible car cet élément contient encore d'autres données (ex: une catégorie avec des articles).\n\nPour résoudre ce problème : rendez-vous dans le menu correspondant (par ex. 'Articles' dans la barre latérale gauche) pour supprimer ces éléments ou leur attribuer une nouvelle catégorie, puis réessayez.", 
        status: 400 
      };
    }

    return { error: msg || fallbackMessage, status: 500 };
  }

  return { error: fallbackMessage, status: 500 };
}
