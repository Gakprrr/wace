import { NextResponse } from "next/server";
import { getUserStats } from "@/backend/services/stats.service";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const stats = await getUserStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
