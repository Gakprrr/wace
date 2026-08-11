import { NextResponse } from "next/server";
import { requireAdmin, errorResponse } from "@/backend/utils/auth";
import { updateAdminCredentials, findUserById, comparePassword } from "@/backend/services/auth.service";

export async function PUT(request: Request) {
  try {
    const adminUser = await requireAdmin(request);
    const { name, email, currentPassword, newPassword } = await request.json();

    // Verify current password if user is changing email or setting a new password
    if (email || newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Le mot de passe actuel est requis pour modifier l'email ou le mot de passe." },
          { status: 400 }
        );
      }
      
      const dbUser = await findUserById(adminUser.userId);
      if (!dbUser || !dbUser.password) {
        return NextResponse.json({ error: "Utilisateur introuvable ou compte Google (mot de passe non modifiable)." }, { status: 400 });
      }

      const isMatch = await comparePassword(currentPassword, dbUser.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Le mot de passe actuel est incorrect." }, { status: 400 });
      }
    }

    const updated = await updateAdminCredentials(adminUser.userId, {
      name: name || undefined,
      email: email || undefined,
      newPassword: newPassword || undefined,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    const { error: err, status } = errorResponse(error);
    return NextResponse.json({ error: err }, { status });
  }
}
