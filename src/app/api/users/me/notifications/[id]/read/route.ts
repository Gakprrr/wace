import { NextResponse } from "next/server";
import { markNotificationAsRead } from "@/backend/services/notification.service";
import { requireAuth, errorResponse } from "@/backend/utils/auth";
import { db } from "@/backend/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    // Check if notification exists and belongs to this user
    const notification = await db.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return NextResponse.json({ error: "Notification non trouvée" }, { status: 404 });
    }

    if (notification.userId !== user.userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const updated = await markNotificationAsRead(id);
    return NextResponse.json(updated);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
