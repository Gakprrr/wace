import { NextResponse } from "next/server";
import { updateComment, deleteComment } from "@/backend/services/comment.service";
import { requireAuth, errorResponse } from "@/backend/utils/auth";
import { Role } from "@prisma/client";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "content est requis" }, { status: 400 });
    }

    const comment = await updateComment(id, user.userId, content);
    return NextResponse.json(comment);
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
    const user = await requireAuth(request);
    const { id } = await params;

    const isAdmin = user.role === Role.ADMIN;
    await deleteComment(id, user.userId, isAdmin);

    return NextResponse.json({ message: "Commentaire supprimé avec succès" });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
