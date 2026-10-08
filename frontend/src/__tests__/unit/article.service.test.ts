import { describe, it, expect, vi, beforeEach } from 'vitest';
/**
 * Tests unitaires — article.service.ts
 * Vérifie la logique de filtrage, création, et recherche d'articles
 * La DB Prisma est mockée pour isoler la logique métier.
 */
import { getArticles, createArticle, searchArticles, getFeaturedArticles, toggleArticleLike } from '@/backend/services/article.service';
import { ItemState } from '@prisma/client';

// Mock Prisma
const mockArticle = {
  id: 'article-1',
  title: 'Chemise Oxford Bleue',
  description: 'Belle chemise en coton',
  price: { toNumber: () => 5000 },
  oldPrice: { toNumber: () => 8000 },
  stock: 3,
  state: ItemState.BON_ETAT,
  images: ['https://example.com/img.jpg'],
  isAvailable: true,
  isNew: false,
  views: 10,
  categoryId: 'cat-1',
  category: { id: 'cat-1', name: 'Vêtements Homme', slug: 'vetements-homme' },
  _count: { likes: 5, comments: 2 },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockDb = {
  article: {
    create: vi.fn().mockResolvedValue(mockArticle),
    findMany: vi.fn().mockResolvedValue([mockArticle]),
    findUnique: vi.fn().mockResolvedValue(mockArticle),
    update: vi.fn().mockResolvedValue(mockArticle),
    delete: vi.fn().mockResolvedValue(mockArticle),
  },
  like: {
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    count: vi.fn().mockResolvedValue(5),
  },
  category: {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock('@/backend/db', () => ({
  get db() {
    return mockDb;
  }
}));

describe('ArticleService — getArticles', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retourne tous les articles sans filtres', async () => {
    const articles = await getArticles();
    expect(mockDb.article.findMany).toHaveBeenCalledTimes(1);
    expect(articles).toHaveLength(1);
    expect(articles[0].title).toBe('Chemise Oxford Bleue');
  });

  it('passe les filtres corrects à Prisma (categoryId, state, prix)', async () => {
    await getArticles({ categoryId: 'cat-1', state: ItemState.NEUF, minPrice: 1000, maxPrice: 9000, limit: 10, offset: 0 });

    const call = mockDb.article.findMany.mock.calls[0][0];
    expect(call.where.categoryId).toBe('cat-1');
    expect(call.where.state).toBe(ItemState.NEUF);
    expect(call.where.price.gte).toBe(1000);
    expect(call.where.price.lte).toBe(9000);
    expect(call.take).toBe(10);
    expect(call.skip).toBe(0);
  });
});

describe('ArticleService — createArticle', () => {
  beforeEach(() => vi.clearAllMocks());

  it('crée un article avec les bons paramètres', async () => {
    await createArticle({
      title: 'Test Article',
      description: 'Desc test',
      price: 3500,
      stock: 2,
      state: ItemState.NEUF,
      images: [],
      categoryId: 'cat-1',
    });

    const call = mockDb.article.create.mock.calls[0][0];
    expect(call.data.title).toBe('Test Article');
    expect(call.data.stock).toBe(2);
    expect(call.data.state).toBe(ItemState.NEUF);
    expect(call.data.isAvailable).toBe(true); // default
  });
});

describe('ArticleService — searchArticles', () => {
  beforeEach(() => vi.clearAllMocks());

  it('recherche avec un OR sur title et description', async () => {
    await searchArticles('chemise');
    const call = mockDb.article.findMany.mock.calls[0][0];
    expect(call.where.OR).toHaveLength(2);
    expect(call.where.OR[0].title.contains).toBe('chemise');
    expect(call.where.OR[1].description.contains).toBe('chemise');
  });
});

describe('ArticleService — toggleArticleLike', () => {
  beforeEach(() => vi.clearAllMocks());

  it("crée un like si l'utilisateur n'a pas encore liké", async () => {
    mockDb.like.findUnique.mockResolvedValueOnce(null);
    mockDb.like.create.mockResolvedValueOnce({});

    const result = await toggleArticleLike('user-1', 'article-1');
    expect(result.liked).toBe(true);
    expect(mockDb.like.create).toHaveBeenCalledTimes(1);
  });

  it("supprime un like si l'utilisateur a déjà liké", async () => {
    mockDb.like.findUnique.mockResolvedValueOnce({ userId: 'user-1', articleId: 'article-1' });
    mockDb.like.delete.mockResolvedValueOnce({});

    const result = await toggleArticleLike('user-1', 'article-1');
    expect(result.liked).toBe(false);
    expect(mockDb.like.delete).toHaveBeenCalledTimes(1);
  });
});

describe('ArticleService — getFeaturedArticles', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retourne au maximum 8 articles', async () => {
    await getFeaturedArticles();
    const call = mockDb.article.findMany.mock.calls[0][0];
    expect(call.take).toBe(8);
    expect(call.where.isAvailable).toBe(true);
  });
});
