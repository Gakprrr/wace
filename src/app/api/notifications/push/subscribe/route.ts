import { NextResponse } from "next/server";
import { getUserFromRequest, errorResponse } from "@/backend/utils/auth";
import { db } from "@/backend/db";

export async function POST(request: Request) {
  try {
    const subscription = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Subscription object with endpoint is required" },
        { status: 400 }
      );
    }

    const user = await getUserFromRequest(request);

    if (!user) {
      // Anonymous subscriptions are not persisted — push requires authentication
      return NextResponse.json(
        { error: "Authentification requise pour activer les notifications push" },
        { status: 401 }
      );
    }

    const subscriptionStr = JSON.stringify(subscription);

    // Upsert by endpoint: replace existing subscription for this user/device
    const existing = await db.pushSubscription.findFirst({
      where: { userId: user.userId, subscription: { contains: subscription.endpoint } },
    });

    if (existing) {
      await db.pushSubscription.update({
        where: { id: existing.id },
        data: { subscription: subscriptionStr },
      });
    } else {
      await db.pushSubscription.create({
        data: { userId: user.userId, subscription: subscriptionStr },
      });
    }

    return NextResponse.json({ success: true, message: "Subscription registered successfully" });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
