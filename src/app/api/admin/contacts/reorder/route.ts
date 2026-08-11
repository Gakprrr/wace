import { NextResponse } from "next/server";
import { reorderContacts } from "@/backend/services/contact.service";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";

export async function PUT(request: Request) {
  try {
    await requireAdmin(request);
    const { orderedIds } = await request.json();

    if (!orderedIds || !Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "orderedIds (tableau d'IDs) est requis" }, { status: 400 });
    }

    await reorderContacts(orderedIds);
    return NextResponse.json({ message: "Contacts réordonnés avec succès" });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
