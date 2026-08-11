import { NextResponse } from "next/server";
import { toggleArticleLike, getArticleLikes } from "@/backend/services/article.service";
import { requireAuth, getUserFromRequest, errorResponse } from "@/backend/utils/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(request);
    const userId = user?.userId;

    const status = await getArticleLikes(id, userId);
    return NextResponse.json(status);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const result = await toggleArticleLike(user.userId, id);
    return NextResponse.json(result);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
