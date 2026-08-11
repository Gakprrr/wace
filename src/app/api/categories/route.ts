import { NextResponse } from "next/server";
import { getCategories, createCategory } from "@/backend/services/article.service";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const { name, slug, icon } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: "name et slug sont requis" }, { status: 400 });
    }

    const category = await createCategory(name, slug, icon);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
