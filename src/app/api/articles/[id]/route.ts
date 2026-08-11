import { NextResponse } from "next/server";
import {
  getArticleById,
  updateArticle,
  deleteArticle,
  incrementArticleViews,
} from "@/backend/services/article.service";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";
import { ItemState } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await getArticleById(id);
    if (!article) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    }

    // Fire-and-forget: increment views without blocking the response
    incrementArticleViews(id).catch((err) =>
      console.error("Failed to increment article views:", err)
    );

    return NextResponse.json(article);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}

// Allowed fields for article updates — prevents mass-assignment
const ALLOWED_UPDATE_FIELDS: Array<keyof Parameters<typeof updateArticle>[1]> = [
  "title",
  "description",
  "price",
  "oldPrice",
  "stock",
  "state",
  "images",
  "categoryId",
  "isAvailable",
  "isNew",
];

const VALID_STATES = Object.values(ItemState) as string[];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();

    // Whitelist fields to prevent mass-assignment
    const safeBody: Record<string, unknown> = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        safeBody[field] = body[field];
      }
    }

    if (Object.keys(safeBody).length === 0) {
      return NextResponse.json({ error: "Aucun champ valide fourni pour la mise à jour" }, { status: 400 });
    }

    // Validate state enum if provided
    if (safeBody.state !== undefined && !VALID_STATES.includes(safeBody.state as string)) {
      return NextResponse.json(
        { error: `État invalide. Valeurs acceptées : ${VALID_STATES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (safeBody.price !== undefined && (typeof safeBody.price !== "number" || (safeBody.price as number) < 0)) {
      return NextResponse.json({ error: "Prix invalide" }, { status: 400 });
    }
    if (safeBody.stock !== undefined && (typeof safeBody.stock !== "number" || (safeBody.stock as number) < 0)) {
      return NextResponse.json({ error: "Stock invalide" }, { status: 400 });
    }

    const article = await updateArticle(id, safeBody as Parameters<typeof updateArticle>[1]);
    return NextResponse.json(article);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    await deleteArticle(id);
    return NextResponse.json({ message: "Article supprimé avec succès" });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
