import { NextResponse } from "next/server";
import { getUserProfile } from "@/backend/services/auth.service";
import { getUserFromRequest } from "@/backend/utils/auth";

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const profile = await getUserProfile(user.userId);
    if (!profile) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: profile,
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
