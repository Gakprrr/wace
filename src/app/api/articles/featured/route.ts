import { NextResponse } from "next/server";
import { getFeaturedArticles } from "@/backend/services/article.service";
import { errorResponse } from "@/backend/utils/auth";

export async function GET() {
  try {
    const articles = await getFeaturedArticles();
    return NextResponse.json({ articles });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
