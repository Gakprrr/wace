import { NextResponse } from "next/server";
import { sendEmail, sendBulkEmail } from "@/backend/services/notification.service";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const { to, subject, html } = await request.json();

    if (!subject || !html) {
      return NextResponse.json({ error: "subject et html sont requis" }, { status: 400 });
    }

    let result;
    if (to) {
      result = await sendEmail(to, subject, html);
    } else {
      result = await sendBulkEmail(subject, html);
    }

    return NextResponse.json({
      message: "Email envoyé avec succès",
      result,
    });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
