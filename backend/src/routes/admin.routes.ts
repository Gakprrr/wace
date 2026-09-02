import { Router } from "express";
import { getGlobalStats } from "@/services/stats.service";
import { uploadImage } from "@/services/upload.service";
import { db } from "@/db";
import { requireAdminMiddleware } from "@/middleware/expressAuth";
import { errorResponse } from "@/utils/auth";
import ExcelJS from "exceljs";

const router = Router();

// Apply admin middleware to all /api/admin routes
router.use(requireAdminMiddleware);

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const stats = await getGlobalStats();
    res.json(stats);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// PUT /api/admin/users/:id
router.put("/users/:id", async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const user = await db.user.update({
      where: { id: req.params.id },
      data: { role, isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    res.json(user);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// POST /api/admin/upload
router.post("/upload", async (req, res) => {
  try {
    const { fileData } = req.body;
    if (!fileData) {
      res.status(400).json({ error: "Données de fichier manquantes" });
      return;
    }
    const url = await uploadImage(fileData);
    res.status(201).json({ url });
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// GET /api/admin/export
router.get("/export", async (req, res) => {
  try {
    const articles = await db.article.findMany({
      include: { category: true },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Articles");

    worksheet.columns = [
      { header: "ID", key: "id", width: 25 },
      { header: "Titre", key: "title", width: 30 },
      { header: "Prix", key: "price", width: 15 },
      { header: "Stock", key: "stock", width: 10 },
      { header: "Catégorie", key: "category", width: 20 },
      { header: "État", key: "state", width: 15 },
      { header: "Vues", key: "views", width: 10 },
    ];

    articles.forEach((art) => {
      worksheet.addRow({
        id: art.id,
        title: art.title,
        price: art.price.toString(),
        stock: art.stock,
        category: art.category.name,
        state: art.state,
        views: art.views,
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=articles-wace.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

export default router;
