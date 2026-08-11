import { NextResponse } from "next/server";
import { toggleUserActive } from "@/backend/services/auth.service";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const { active } = await request.json();

    if (active === undefined || typeof active !== "boolean") {
      return NextResponse.json({ error: "Le champ 'active' (booléen) est requis" }, { status: 400 });
    }

    const user = await toggleUserActive(id, active);
    return NextResponse.json({
      message: active ? "Compte réactivé" : "Compte suspendu",
      user,
    });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
