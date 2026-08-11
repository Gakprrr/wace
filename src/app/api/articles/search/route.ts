import { NextResponse } from "next/server";
import { searchArticles } from "@/backend/services/article.service";
import { errorResponse } from "@/backend/utils/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Query param 'q' is required" }, { status: 400 });
    }

    const articles = await searchArticles(query);
    return NextResponse.json(articles);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
