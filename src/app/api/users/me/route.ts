import { NextResponse } from "next/server";
import { getUserProfile, updateUserProfile } from "@/backend/services/auth.service";
import { requireAuth, errorResponse } from "@/backend/utils/auth";

// Only allow avatars hosted on Cloudinary to prevent arbitrary URL injection
const ALLOWED_AVATAR_HOSTS = ["res.cloudinary.com", "placehold.co"];

function isValidAvatarUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_AVATAR_HOSTS.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const profile = await getUserProfile(user.userId);

    if (!profile) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth(request);
    const { name, phone, avatar } = await request.json();

    // Validate avatar URL if provided
    if (avatar !== undefined && avatar !== null && avatar !== "") {
      if (typeof avatar !== "string" || !isValidAvatarUrl(avatar)) {
        return NextResponse.json(
          { error: "URL d'avatar invalide. Seules les images hébergées sur Cloudinary sont acceptées." },
          { status: 400 }
        );
      }
    }

    // Sanitize phone: only allow digits, +, -, spaces
    if (phone !== undefined && phone !== null && !/^[\d\s\+\-\(\)]{0,20}$/.test(phone)) {
      return NextResponse.json({ error: "Numéro de téléphone invalide" }, { status: 400 });
    }

    const updated = await updateUserProfile(user.userId, { name, phone, avatar: avatar || undefined });
    return NextResponse.json(updated);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
