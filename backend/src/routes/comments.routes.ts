import { Router } from "express";
import { addComment, deleteComment, getArticleComments } from "@/services/comment.service";
import { AuthenticatedRequest, requireAuthMiddleware } from "@/middleware/expressAuth";
import { errorResponse } from "@/utils/auth";

const router = Router();

// GET /api/comments/article?articleId=...
router.get("/article", async (req, res) => {
  try {
    const articleId = req.query.articleId as string;
    if (!articleId) {
      res.status(400).json({ error: "L'identifiant de l'article est requis" });
      return;
    }
    const comments = await getArticleComments(articleId);
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

    const comment = await addComment({ userId, articleId, content, rating });
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
    const role = req.user!.role;

    await deleteComment(commentId, userId, role);
    res.json({ success: true, message: "Commentaire supprimé" });
  } catch (error) {
    const err = errorResponse(error);
    res.status(err.status).json({ error: err.error });
  }
});

export default router;
