import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/backend/utils/auth";
import { redisSub } from "@/backend/redis";

// Channels the shared subscriber is already subscribed to
const subscribedChannels = new Set<string>();

async function ensureSubscribed(channel: string) {
  if (!subscribedChannels.has(channel)) {
    try {
      await redisSub.subscribe(channel);
      subscribedChannels.add(channel);
    } catch (err) {
      console.warn(`[SSE] Impossible de s'abonner au canal Redis ${channel}. Le service Redis est peut-être inactif.`);
      // Ne pas jeter d'erreur : permet de garder le flux SSE ouvert même si Redis est hors ligne
    }
  }
}

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    const userId = user?.userId;

    const channels = ["notifications:all"];
    if (userId) {
      channels.push(`notifications:user:${userId}`);
    }

    // Make sure the shared subscriber is subscribed to all relevant channels
    for (const ch of channels) {
      await ensureSubscribed(ch);
    }

    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection event
        controller.enqueue(`data: ${JSON.stringify({ event: "connected" })}\n\n`);

        // Per-client message handler attached to the shared subscriber
        const onMessage = (channel: string, message: string) => {
          if (channels.includes(channel)) {
            try {
              controller.enqueue(`data: ${message}\n\n`);
            } catch {
              // Controller may be closed if client disconnected
            }
          }
        };

        redisSub.on("message", onMessage);

        // Cleanup when the client disconnects
        request.signal.addEventListener("abort", () => {
          redisSub.off("message", onMessage);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("SSE connection error:", error);
    return NextResponse.json({ error: "SSE subscription failed", details: error.message }, { status: 500 });
  }
}
