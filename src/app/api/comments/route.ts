import { NextResponse } from "next/server";
import { createComment } from "@/backend/services/comment.service";
import { requireAuth, errorResponse } from "@/backend/utils/auth";

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);
    const { content, rating, articleId } = await request.json();

    if (!content || !articleId) {
      return NextResponse.json({ error: "content et articleId sont requis" }, { status: 400 });
    }

    const comment = await createComment({
      content,
      rating: rating !== undefined ? parseInt(rating) : undefined,
      userId: user.userId,
      articleId,
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
