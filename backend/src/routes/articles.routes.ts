import { Router } from "express";
import { getArticles, getArticleById, getFeaturedArticles, searchArticles, createArticle, updateArticle, deleteArticle, toggleArticleLike, getArticleLikes } from "@/services/article.service";
import { AuthenticatedRequest, requireAdminMiddleware, requireAuthMiddleware } from "@/middleware/expressAuth";
import { errorResponse } from "@/utils/auth";
import QRCode from "qrcode";

const router = Router();

// GET /api/articles
router.get("/", async (req, res) => {
  try {
    const { category, categorySlug, state, minPrice, maxPrice, limit, offset, page, search } = req.query;
    
    const limitNum = limit ? parseInt(limit as string, 10) : 12;
    const pageNum = page ? parseInt(page as string, 10) : 1;
    const offsetNum = offset ? parseInt(offset as string, 10) : (pageNum - 1) * limitNum;

    const catParam = (categorySlug as string) || (category as string);
    let categoryId: string | undefined = undefined;
    let catSlug: string | undefined = undefined;

    if (catParam) {
      if (catParam.startsWith("cm") || catParam.length > 20) {
        categoryId = catParam;
      } else {
        catSlug = catParam;
      }
    }

    const result = await getArticles({
      categoryId,
      categorySlug: catSlug,
      search: search as string,
      limit: limitNum,
      offset: offsetNum,
      state: state as any,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    });

    res.json({
      articles: result.articles,
      total: result.total,
      page: pageNum,
      totalPages: Math.ceil((result.total || 0) / limitNum),
    });
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// GET /api/articles/featured
router.get("/featured", async (req, res) => {
  try {
    const articles = await getFeaturedArticles();
    res.json(articles);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// GET /api/articles/search
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q as string || "";
    const articles = await searchArticles(q);
    res.json(articles);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// GET /api/articles/:id/qr -> Génère le Code QR du produit
router.get("/:id/qr", async (req, res) => {
  try {
    const article = await getArticleById(req.params.id);
    if (!article) {
      res.status(404).json({ error: "Article non trouvé" });
      return;
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const productUrl = `${clientUrl}/catalogue/${article.id}`;

    const qrDataUrl = await QRCode.toDataURL(productUrl, {
      margin: 2,
      width: 350,
      color: {
        dark: "#705C3B",
        light: "#FFFFFF",
      },
    });

    res.json({
      articleId: article.id,
      title: article.title,
      url: productUrl,
      qrCode: qrDataUrl,
    });
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// GET /api/articles/:id
router.get("/:id", async (req, res) => {
  try {
    const article = await getArticleById(req.params.id);
    if (!article) {
      res.status(404).json({ error: "Article non trouvé" });
      return;
    }
    res.json(article);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// POST /api/articles (Admin)
router.post("/", requireAdminMiddleware, async (req, res) => {
  try {
    const article = await createArticle(req.body);
    res.status(201).json(article);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// PUT /api/articles/:id (Admin)
router.put("/:id", requireAdminMiddleware, async (req, res) => {
  try {
    const article = await updateArticle(req.params.id, req.body);
    res.json(article);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// DELETE /api/articles/:id (Admin)
router.delete("/:id", requireAdminMiddleware, async (req, res) => {
  try {
    await deleteArticle(req.params.id);
    res.json({ success: true, message: "Article supprimé avec succès" });
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// GET /api/articles/:id/like
router.get("/:id/like", async (req: AuthenticatedRequest, res) => {
  try {
    const likesInfo = await getArticleLikes(req.params.id, req.user?.id);
    res.json(likesInfo);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// POST /api/articles/:id/like
router.post("/:id/like", requireAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const result = await toggleArticleLike(req.user!.id, req.params.id);
    const likesInfo = await getArticleLikes(req.params.id, req.user!.id);
    res.json({ liked: result.liked, count: likesInfo.count });
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

export default router;
