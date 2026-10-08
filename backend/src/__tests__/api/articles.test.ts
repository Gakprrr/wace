import { describe, it, expect, vi, beforeEach } from 'vitest';
/**
 * Tests API — GET /api/articles & POST /api/articles
 * On mock DB et auth pour tester la logique des routes.
 */

vi.mock('@/db', () => ({
  db: {
    article: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    category: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

// Mock auth utils pour simuler un admin authentifié
vi.mock('@/utils/auth', () => ({
  requireAdmin: vi.fn().mockResolvedValue({ userId: 'admin-1', role: 'ADMIN', email: 'admin@wace.com' }),
  requireAuth: vi.fn().mockResolvedValue({ userId: 'user-1', role: 'CLIENT', email: 'client@wace.com' }),
}));

import { GET, POST } from '@/app/api/articles/route';
import { db } from '@/db';
import { ItemState } from '@prisma/client';

const mockArticleRow = {
  id: 'article-1',
  title: 'Chemise Oxford Bleue',
  description: 'Belle chemise',
  price: { toNumber: () => 5000 },
  oldPrice: null,
  stock: 3,
  state: ItemState.BON_ETAT,
  images: [],
  isAvailable: true,
  isNew: false,
  views: 0,
  categoryId: 'cat-1',
  category: { id: 'cat-1', name: 'Homme', slug: 'homme' },
  _count: { likes: 0, comments: 0 },
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeGetRequest(params?: Record<string, string>) {
  const url = new URL('http://localhost/api/articles');
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString(), { method: 'GET' });
}

function makePostRequest(body: object, token = 'admin-token') {
  return new Request('http://localhost/api/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

describe('GET /api/articles', () => {
  beforeEach(() => vi.clearAllMocks());

  it("retourne une liste d'articles avec status 200", async () => {
    (db.article.findMany as any).mockResolvedValueOnce([mockArticleRow]);
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json[0].title).toBe('Chemise Oxford Bleue');
  });

  it('retourne 400 pour un état invalide', async () => {
    const res = await GET(makeGetRequest({ state: 'INVALIDE' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('État invalide');
  });

  it('retourne 400 pour un minPrice négatif', async () => {
    const res = await GET(makeGetRequest({ minPrice: '-100' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('minPrice invalide');
  });

  it('filtre par état correctement', async () => {
    (db.article.findMany as any).mockResolvedValueOnce([]);
    await GET(makeGetRequest({ state: ItemState.NEUF }));
    const call = (db.article.findMany as any).mock.calls[0][0];
    expect(call.where.state).toBe(ItemState.NEUF);
  });

  it('plafonne la limite à 100', async () => {
    (db.article.findMany as any).mockResolvedValueOnce([]);
    await GET(makeGetRequest({ limit: '9999' }));
    const call = (db.article.findMany as any).mock.calls[0][0];
    expect(call.take).toBe(100);
  });
});

describe('POST /api/articles', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retourne 400 si les champs requis manquent', async () => {
    const res = await POST(makePostRequest({ title: 'Seul titre' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('requis');
  });

  it('retourne 400 pour un prix invalide', async () => {
    const res = await POST(makePostRequest({
      title: 'Test',
      description: 'Desc',
      price: -50,
      categoryId: 'cat-1',
    }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Prix invalide');
  });

  it('crée un article et retourne 201', async () => {
    (db.article.create as any).mockResolvedValueOnce(mockArticleRow);
    const res = await POST(makePostRequest({
      title: 'Chemise Test',
      description: 'Belle chemise',
      price: 5000,
      categoryId: 'cat-1',
      stock: 2,
      state: ItemState.NEUF,
      images: [],
    }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.title).toBe('Chemise Oxford Bleue');
  });
});
