import { NextResponse } from "next/server";
import { updateContact, deleteContact } from "@/backend/services/contact.service";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();

    const contact = await updateContact(id, body);
    return NextResponse.json(contact);
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

    await deleteContact(id);
    return NextResponse.json({ message: "Contact supprimé avec succès" });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
