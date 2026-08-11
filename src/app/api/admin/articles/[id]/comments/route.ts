import { NextResponse } from "next/server";
import { db } from "@/backend/db";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    
    const comments = await db.comment.findMany({
      where: { articleId: id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
