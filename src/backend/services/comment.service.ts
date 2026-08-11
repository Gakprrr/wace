import { db } from "@/backend/db";
import { ValidationError, NotFoundError, ForbiddenError } from "@/backend/utils/auth";

export async function createComment(data: {
  content: string;
  rating?: number;
  userId: string;
  articleId: string;
}) {
  if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
    throw new ValidationError("La note doit être comprise entre 1 et 5");
  }

  // Verify the article exists before inserting (avoids opaque FK error)
  const article = await db.article.findUnique({ where: { id: data.articleId }, select: { id: true } });
  if (!article) throw new NotFoundError("Article non trouvé");

  return db.comment.create({
    data: {
      content: data.content,
      rating: data.rating ?? null,
      userId: data.userId,
      articleId: data.articleId,
    },
    include: {
      user: {
        select: { id: true, name: true, avatar: true },
      },
    },
  });
}

export async function getCommentsByArticle(articleId: string, limit = 20, offset = 0) {
  return db.comment.findMany({
    where: { articleId },
    include: {
      user: {
        select: { id: true, name: true, avatar: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

export async function updateComment(commentId: string, userId: string, content: string) {
  const comment = await db.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new NotFoundError("Commentaire non trouvé");
  if (comment.userId !== userId) throw new ValidationError("Vous ne pouvez modifier que vos propres commentaires");

  return db.comment.update({
    where: { id: commentId },
    data: { content },
  });
}

export async function deleteComment(commentId: string, userId: string, isAdmin: boolean) {
  const comment = await db.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new NotFoundError("Commentaire non trouvé");
  if (!isAdmin && comment.userId !== userId) {
    throw new ForbiddenError("Vous ne pouvez supprimer que vos propres commentaires");
  }

  return db.comment.delete({
    where: { id: commentId },
  });
}
