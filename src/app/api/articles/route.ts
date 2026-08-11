import { NextResponse } from "next/server";
import { getArticles, createArticle } from "@/backend/services/article.service";
import { requireAdmin } from "@/backend/utils/auth";
import { ItemState } from "@prisma/client";

const VALID_STATES = Object.values(ItemState) as string[];
const MAX_LIMIT = 100;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get("categoryId") || undefined;
    const categorySlug = searchParams.get("categorySlug") || searchParams.get("category") || undefined;

    // Validate state enum at runtime
    const stateParam = searchParams.get("state");
    if (stateParam && !VALID_STATES.includes(stateParam)) {
      return NextResponse.json(
        { error: `État invalide. Valeurs acceptées : ${VALID_STATES.join(", ")}` },
        { status: 400 }
      );
    }
    const state = (stateParam as ItemState) || undefined;

    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;

    if (minPrice !== undefined && (isNaN(minPrice) || minPrice < 0)) {
      return NextResponse.json({ error: "minPrice invalide" }, { status: 400 });
    }
    if (maxPrice !== undefined && (isNaN(maxPrice) || maxPrice < 0)) {
      return NextResponse.json({ error: "maxPrice invalide" }, { status: 400 });
    }

    const isAvailableParam = searchParams.get("isAvailable");
    const isAvailable =
      isAvailableParam === "true" ? true : isAvailableParam === "false" ? false : undefined;

    // Cap limit to prevent full-table scans
    const rawLimit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    const limit = rawLimit !== undefined ? Math.min(Math.max(1, rawLimit), MAX_LIMIT) : undefined;

    const rawOffset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined;
    const offset = rawOffset !== undefined ? Math.max(0, rawOffset) : undefined;

    const articles = await getArticles({ categoryId, categorySlug, state, minPrice, maxPrice, isAvailable, limit, offset });
    return NextResponse.json(articles);
  } catch (error: any) {
    console.error("GET /api/articles error:", error);
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { title, description, price, oldPrice, stock, state, images, categoryId, isAvailable, isNew } = body;

    if (!title || !description || price === undefined || !categoryId) {
      return NextResponse.json(
        { error: "title, description, price et categoryId sont requis" },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || price < 0) {
      return NextResponse.json({ error: "Prix invalide" }, { status: 400 });
    }

    if (state && !VALID_STATES.includes(state)) {
      return NextResponse.json(
        { error: `État invalide. Valeurs acceptées : ${VALID_STATES.join(", ")}` },
        { status: 400 }
      );
    }

    const article = await createArticle({
      title,
      description,
      price,
      oldPrice,
      stock,
      state: state || ItemState.BON_ETAT,
      images: images || [],
      categoryId,
      isAvailable,
      isNew,
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/articles error:", error);
    const status =
      error.message.includes("Forbidden") ? 403
      : error.message.includes("Unauthorized") ? 401
      : 500;
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status });
  }
}
