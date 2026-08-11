import { NextResponse } from "next/server";
import { getCommentsByArticle } from "@/backend/services/comment.service";
import { errorResponse } from "@/backend/utils/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0;

    const comments = await getCommentsByArticle(articleId, limit, offset);
    return NextResponse.json(comments);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
