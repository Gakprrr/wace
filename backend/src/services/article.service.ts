import { db } from "@/db";
import { ItemState, Prisma } from "@prisma/client";
// --- Category Services ---

export async function createCategory(name: string, slug: string, icon?: string) {
  return db.category.create({
    data: { name, slug, icon },
  });
}

export async function getCategories() {
  return db.category.findMany({
    include: {
      _count: {
        select: { articles: true },
      },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
    include: {
      articles: {
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });
}

export async function updateCategory(id: string, data: { name?: string; slug?: string; icon?: string }) {
  return db.category.update({
    where: { id },
    data,
  });
}

export async function deleteCategory(id: string) {
  return db.category.delete({
    where: { id },
  });
}

// --- Article Services ---

interface CreateArticleInput {
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  stock?: number;
  state: ItemState;
  images: string[];
  categoryId: string;
  isAvailable?: boolean;
  isNew?: boolean;
}

export async function createArticle(data: CreateArticleInput) {
  return db.article.create({
    data: {
      title: data.title,
      description: data.description,
      price: new Prisma.Decimal(data.price),
      oldPrice: data.oldPrice !== undefined ? new Prisma.Decimal(data.oldPrice) : null,
      stock: data.stock ?? 0,
      state: data.state,
      images: data.images,
      categoryId: data.categoryId,
      isAvailable: data.isAvailable ?? true,
      isNew: data.isNew ?? false,
    },
  });
}

interface GetArticlesFilters {
  categoryId?: string;
  categorySlug?: string;
  state?: ItemState;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  limit?: number;
  offset?: number;
}

export async function getArticles(filters?: GetArticlesFilters) {
  const where: Prisma.ArticleWhereInput = {};

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }
  
  if (filters?.categorySlug) {
    where.category = { slug: filters.categorySlug };
  }

  if (filters?.state) {
    where.state = filters.state;
  }

  if (filters?.isAvailable !== undefined) {
    where.isAvailable = filters.isAvailable;
  }

  if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) {
      (where.price as Prisma.DecimalFilter).gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      (where.price as Prisma.DecimalFilter).lte = filters.maxPrice;
    }
  }

  const [articles, total] = await Promise.all([
    db.article.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
      take: filters?.limit,
      skip: filters?.offset,
      orderBy: { createdAt: "desc" },
    }),
    db.article.count({ where }),
  ]);

  return { articles, total };
}

export async function getArticleById(id: string) {
  return db.article.findUnique({
    where: { id },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      _count: {
        select: { likes: true, comments: true },
      },
      comments: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function incrementArticleViews(id: string) {
  return db.article.update({
    where: { id },
    data: {
      views: { increment: 1 },
    },
  });
}

interface UpdateArticleInput {
  title?: string;
  description?: string;
  price?: number;
  oldPrice?: number;
  stock?: number;
  state?: ItemState;
  images?: string[];
  categoryId?: string;
  isAvailable?: boolean;
  isNew?: boolean;
}

export async function updateArticle(id: string, data: UpdateArticleInput) {
  const prismaData: Prisma.ArticleUpdateInput = {};
  if (data.title !== undefined) prismaData.title = data.title;
  if (data.description !== undefined) prismaData.description = data.description;
  if (data.price !== undefined) prismaData.price = new Prisma.Decimal(data.price);
  if (data.oldPrice !== undefined) {
    prismaData.oldPrice = data.oldPrice !== null ? new Prisma.Decimal(data.oldPrice) : null;
  }
  if (data.stock !== undefined) prismaData.stock = data.stock;
  if (data.state !== undefined) prismaData.state = data.state;
  if (data.images !== undefined) prismaData.images = data.images;
  if (data.categoryId !== undefined) prismaData.category = { connect: { id: data.categoryId } };
  if (data.isAvailable !== undefined) prismaData.isAvailable = data.isAvailable;
  if (data.isNew !== undefined) prismaData.isNew = data.isNew;

  return db.article.update({
    where: { id },
    data: prismaData,
  });
}

export async function updateArticleStock(id: string, stock: number) {
  return db.article.update({
    where: { id },
    data: {
      stock,
      isAvailable: stock > 0,
    },
  });
}

export async function updateArticlePrice(id: string, price: number, oldPrice?: number) {
  return db.article.update({
    where: { id },
    data: {
      price: new Prisma.Decimal(price),
      oldPrice: oldPrice !== undefined ? new Prisma.Decimal(oldPrice) : undefined,
    },
  });
}

export async function deleteArticle(id: string) {
  return db.article.delete({
    where: { id },
  });
}

// --- Like / Favorite Services ---

export async function toggleArticleLike(userId: string, articleId: string) {
  const existingLike = await db.like.findUnique({
    where: {
      userId_articleId: { userId, articleId },
    },
  });

  if (existingLike) {
    await db.like.delete({
      where: {
        userId_articleId: { userId, articleId },
      },
    });
    return { liked: false };
  } else {
    await db.like.create({
      data: { userId, articleId },
    });
    return { liked: true };
  }
}

export async function getArticleLikes(articleId: string, userId?: string) {
  const count = await db.like.count({
    where: { articleId },
  });

  let userHasLiked = false;
  if (userId) {
    const like = await db.like.findUnique({
      where: {
        userId_articleId: { userId, articleId },
      },
    });
    userHasLiked = !!like;
  }

  return { count, liked: userHasLiked };
}

export async function getUserLikedArticles(userId: string) {
  return db.like.findMany({
    where: { userId },
    include: {
      article: {
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
  });
}

// --- Search Services ---

export async function searchArticles(query: string) {
  return db.article.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
}

export async function getFeaturedArticles() {
  const articles = await db.article.findMany({
    where: {
      OR: [{ isNew: true }, { stock: { lte: 2, gt: 0 } }],
      isAvailable: true,
    },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  if (articles.length === 0) {
    return db.article.findMany({
      where: { isAvailable: true },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  }

  return articles;
}
