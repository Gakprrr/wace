import { NextResponse } from "next/server";
import { db } from "@/backend/db";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";

/**
 * List all users who liked an article.
 * Restricted to admins — exposes user identities and behavioral data.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const likes = await db.like.findMany({
      where: { articleId: id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return NextResponse.json(likes);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
