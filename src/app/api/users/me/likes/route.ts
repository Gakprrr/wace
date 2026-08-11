import { NextResponse } from "next/server";
import { getUserLikedArticles } from "@/backend/services/article.service";
import { requireAuth, errorResponse } from "@/backend/utils/auth";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const liked = await getUserLikedArticles(user.userId);
    return NextResponse.json(liked);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
