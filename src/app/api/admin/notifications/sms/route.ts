import { NextResponse } from "next/server";
import { sendSMS, sendBulkSMS } from "@/backend/services/notification.service";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
    const { to, body } = await request.json();

    if (!body) {
      return NextResponse.json({ error: "body est requis" }, { status: 400 });
    }

    let result;
    if (to) {
      result = await sendSMS(to, body);
    } else {
      result = await sendBulkSMS(body);
    }

    return NextResponse.json({
      message: "SMS envoyé avec succès",
      result,
    });
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
