import { NextResponse } from "next/server";
import { getUserNotifications } from "@/backend/services/notification.service";
import { requireAuth, errorResponse } from "@/backend/utils/auth";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const notifications = await getUserNotifications(user.userId);
    return NextResponse.json(notifications);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
