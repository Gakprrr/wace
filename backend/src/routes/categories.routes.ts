import { Router } from "express";
import { db } from "@/db";
import { requireAdminMiddleware } from "@/middleware/expressAuth";
import { errorResponse } from "@/utils/auth";

const router = Router();

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { name: "asc" },
    });
    res.json(categories);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// GET /api/categories/:idOrSlug
router.get("/:idOrSlug", async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const category = await db.category.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        articles: true,
      },
    });

    if (!category) {
      res.status(404).json({ error: "Catégorie non trouvée" });
      return;
    }

    res.json(category);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// POST /api/categories (Admin)
router.post("/", requireAdminMiddleware, async (req, res) => {
  try {
    const { name, slug, icon } = req.body;
    const category = await db.category.create({
      data: { name, slug, icon },
    });
    res.status(201).json(category);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// PUT /api/categories/:idOrSlug (Admin)
router.put("/:idOrSlug", requireAdminMiddleware, async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const { name, slug, icon } = req.body;
    
    const category = await db.category.update({
      where: { id: idOrSlug },
      data: { name, slug, icon },
    });
    
    res.json(category);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// DELETE /api/categories/:idOrSlug (Admin)
router.delete("/:idOrSlug", requireAdminMiddleware, async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    await db.category.delete({
      where: { id: idOrSlug },
    });
    res.json({ success: true, message: "Catégorie supprimée" });
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

export default router;
