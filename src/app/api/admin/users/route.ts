import { NextResponse } from "next/server";
import { listAllUsers } from "@/backend/services/auth.service";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const users = await listAllUsers();
    return NextResponse.json(users);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
