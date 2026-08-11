import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_super_secret_key_change_me_in_production"
);

// Paths that require authentication
const protectedPaths = ["/admin", "/profile", "/wishlist", "/notifications"];

// Paths that require ADMIN role
const adminPaths = ["/admin"];

/**
 * Next.js 16 Proxy (formerly Middleware).
 * Runs before every matched route — enforces auth and role checks.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path requires protection
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Check admin role for admin paths
    const isAdminPath = adminPaths.some((p) => pathname.startsWith(p));
    if (isAdminPath && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check 2FA verification if enabled
    if (payload.twoFactorEnabled && !payload.twoFactorVerified) {
      // Allow access to the 2FA verification page itself
      if (!pathname.startsWith("/2fa")) {
        return NextResponse.redirect(new URL("/2fa", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    // Invalid or expired token — clear the stale cookie
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/wishlist/:path*", "/notifications/:path*"],
};
