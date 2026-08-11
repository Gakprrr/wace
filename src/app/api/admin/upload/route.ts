import { NextResponse } from "next/server";
import { uploadImage } from "@/backend/services/upload.service";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni dans le champ 'file'" }, { status: 400 });
    }

    const secureUrl = await uploadImage(file);
    return NextResponse.json({ secureUrl });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
