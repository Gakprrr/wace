import { Router } from "express";
import { createComment, deleteComment, getCommentsByArticle } from "@/services/comment.service";
import { AuthenticatedRequest, requireAuthMiddleware } from "@/middleware/expressAuth";
import { errorResponse } from "@/utils/auth";
import { Role } from "@prisma/client";

const router = Router();

// GET /api/comments/article
router.get("/article", async (req, res) => {
  try {
    const articleId = req.query.articleId as string;
    if (!articleId) {
      res.status(400).json({ error: "L'identifiant de l'article est requis" });
      return;
    }
    const comments = await getCommentsByArticle(articleId);
    res.json(comments);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// POST /api/comments
router.post("/", requireAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { articleId, content, rating } = req.body;
    const userId = req.user!.id;

    const comment = await createComment({ userId, articleId, content, rating });
    res.status(201).json(comment);
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

// DELETE /api/comments/:id
router.delete("/:id", requireAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === Role.ADMIN;

    await deleteComment(commentId, userId, isAdmin);
    res.json({ success: true, message: "Commentaire supprimé" });
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

export default router;
