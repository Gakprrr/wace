import { NextResponse } from "next/server";
import { findUserById, deleteUserByAdmin } from "@/backend/services/auth.service";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const user = await findUserById(id);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Exclude password hash before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;

    return NextResponse.json(safeUser);
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
    const admin = await requireAdmin(request);
    const { id } = await params;

    // Prevent an admin from deleting their own account
    if (id === admin.userId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer votre propre compte administrateur" },
        { status: 400 }
      );
    }

    await deleteUserByAdmin(id);
    return NextResponse.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
