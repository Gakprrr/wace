import { NextResponse } from "next/server";
import { toggleContact } from "@/backend/services/contact.service";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const contact = await toggleContact(id);
    return NextResponse.json({
      message: contact.isActive ? "Contact activé" : "Contact désactivé",
      contact,
    });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
