import { NextResponse } from "next/server";
import { updateArticlePrice } from "@/backend/services/article.service";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const { price, oldPrice } = await request.json();

    if (price === undefined || typeof price !== "number" || price < 0) {
      return NextResponse.json({ error: "Prix de vente invalide" }, { status: 400 });
    }

    if (oldPrice !== undefined && oldPrice !== null && (typeof oldPrice !== "number" || oldPrice < 0)) {
      return NextResponse.json({ error: "Ancien prix invalide" }, { status: 400 });
    }

    const article = await updateArticlePrice(id, price, oldPrice ?? undefined);
    return NextResponse.json(article);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
