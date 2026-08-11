import { NextResponse } from "next/server";
import { getPublicContacts } from "@/backend/services/contact.service";
import { errorResponse } from "@/backend/utils/auth";

export async function GET() {
  try {
    const contacts = await getPublicContacts();
    return NextResponse.json(contacts);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
