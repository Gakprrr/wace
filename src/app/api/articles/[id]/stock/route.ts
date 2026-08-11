import { NextResponse } from "next/server";
import { updateArticleStock } from "@/backend/services/article.service";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const { stock } = await request.json();

    if (stock === undefined || typeof stock !== "number" || stock < 0) {
      return NextResponse.json({ error: "Stock invalide" }, { status: 400 });
    }

    const article = await updateArticleStock(id, stock);
    return NextResponse.json(article);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
