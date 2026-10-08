import { handlers } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const API_BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const EXPRESS_AUTH_ROUTES = ["login", "register", "session", "logout", "2fa", "google"];

async function proxyToExpress(req: NextRequest, path: string) {
  const targetUrl = `${API_BACKEND_URL}/auth/${path}${req.nextUrl.search}`;
  const headers = new Headers(req.headers);
  headers.delete("host");

  try {
    const body = req.method !== "GET" && req.method !== "HEAD" ? await req.arrayBuffer() : undefined;
    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });

    const resHeaders = new Headers(res.headers);
    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
    });
  } catch (err) {
    console.error("Proxy error to Express:", err);
    return NextResponse.json({ error: "Serveur backend indisponible" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ nextauth: string[] }> }) {
  const resolvedParams = await params;
  const action = resolvedParams?.nextauth?.[0];
  if (action && EXPRESS_AUTH_ROUTES.includes(action)) {
    const path = resolvedParams.nextauth.join("/");
    return proxyToExpress(req, path);
  }
  return handlers.GET(req);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ nextauth: string[] }> }) {
  const resolvedParams = await params;
  const action = resolvedParams?.nextauth?.[0];
  if (action && EXPRESS_AUTH_ROUTES.includes(action)) {
    const path = resolvedParams.nextauth.join("/");
    return proxyToExpress(req, path);
  }
  return handlers.POST(req);
}
