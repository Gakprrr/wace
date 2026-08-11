import { NextResponse } from "next/server";
import { getAllContacts, createContact } from "@/backend/services/contact.service";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const contacts = await getAllContacts();
    return NextResponse.json(contacts);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const { platform, label, url, icon, isActive, order } = body;

    if (!platform || !label || !url) {
      return NextResponse.json({ error: "platform, label et url sont requis" }, { status: 400 });
    }

    const contact = await createContact({ platform, label, url, icon, isActive, order });
    return NextResponse.json(contact, { status: 201 });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
