import { NextResponse } from "next/server";
import { db } from "@/backend/db";
import { getCategoryBySlug, updateCategory, deleteCategory } from "@/backend/services/article.service";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";

// Helper to find category by either ID or Slug
async function findCategoryByIdOrSlug(idOrSlug: string) {
  let category = await db.category.findUnique({
    where: { id: idOrSlug },
    include: {
      articles: {
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  if (!category) {
    category = await getCategoryBySlug(idOrSlug);
  }

  return category;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  try {
    const { idOrSlug } = await params;
    const category = await findCategoryByIdOrSlug(idOrSlug);

    if (!category) {
      return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  try {
    await requireAdmin(request);
    const { idOrSlug } = await params;
    const body = await request.json();

    // Find actual category first to get its ID
    const category = await findCategoryByIdOrSlug(idOrSlug);
    if (!category) {
      return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });
    }

    const updated = await updateCategory(category.id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ idOrSlug: string }> }
) {
  try {
    await requireAdmin(request);
    const { idOrSlug } = await params;

    const category = await findCategoryByIdOrSlug(idOrSlug);
    if (!category) {
      return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });
    }

    await deleteCategory(category.id);
    return NextResponse.json({ message: "Catégorie supprimée avec succès" });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
