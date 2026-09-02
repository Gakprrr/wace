import { Router } from "express";
import { db } from "@/db";
import { AuthenticatedRequest, requireAuthMiddleware } from "@/middleware/expressAuth";
import { errorResponse } from "@/utils/auth";

const router = Router();

// GET /api/users/me
router.get("/me", requireAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "Utilisateur non trouvé" });
      return;
    }

    res.json(user);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// PUT /api/users/me
router.put("/me", requireAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const updatedUser = await db.user.update({
      where: { id: req.user!.id },
      data: { name, phone, avatar },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        twoFactorEnabled: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

export default router;
