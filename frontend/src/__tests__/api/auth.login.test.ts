import { describe, it, expect, vi, beforeEach } from 'vitest';
/**
 * Tests API — POST /api/auth/login (E2E backend)
 * On mock Redis et la DB pour tester uniquement la logique de la route.
 */

// Mock Redis avant tout import
vi.mock('@/backend/redis', () => ({
  redis: {
    zremrangebyscore: vi.fn().mockResolvedValue(0),
    zcard: vi.fn().mockResolvedValue(0),
    zadd: vi.fn().mockResolvedValue(1),
    pexpire: vi.fn().mockResolvedValue(1),
    zrange: vi.fn().mockResolvedValue([]),
  },
}));

// Mock DB Prisma
const mockUser = {
  id: 'user-123',
  email: 'client@wace.com',
  password: '', // sera remplacé dans beforeEach
  name: 'Test Client',
  role: 'CLIENT' as any,
  avatar: null,
  phone: null,
  isActive: true,
  twoFactorEnabled: false,
  twoFactorSecret: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock('@/backend/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    article: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

import { POST } from '@/app/api/auth/login/route';
import { hashPassword } from '@/backend/services/auth.service';
import { db } from '@/backend/db';

function makeRequest(body: object) {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Définir le vrai hash du mot de passe
    mockUser.password = await hashPassword('password123');
  });

  it('retourne 400 si email ou password manquant', async () => {
    const res = await POST(makeRequest({ email: 'test@wace.com' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('requis');
  });

  it('retourne 401 si utilisateur introuvable', async () => {
    (db.user.findUnique as any).mockResolvedValueOnce(null);
    const res = await POST(makeRequest({ email: 'inexistant@wace.com', password: 'wrong' }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toContain('invalide');
  });

  it('retourne 401 si mot de passe incorrect', async () => {
    (db.user.findUnique as any).mockResolvedValueOnce(mockUser);
    const res = await POST(makeRequest({ email: mockUser.email, password: 'mauvaisMotDePasse' }));
    expect(res.status).toBe(401);
  });

  it('retourne 403 si le compte est suspendu', async () => {
    (db.user.findUnique as any).mockResolvedValueOnce({ ...mockUser, isActive: false });
    const res = await POST(makeRequest({ email: mockUser.email, password: 'password123' }));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain('suspendu');
  });

  it('retourne 200 avec token et user pour des identifiants valides', async () => {
    (db.user.findUnique as any).mockResolvedValueOnce(mockUser);
    const res = await POST(makeRequest({ email: mockUser.email, password: 'password123' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.user).toBeDefined();
    expect(json.user.email).toBe(mockUser.email);
    expect(json.token).toBeDefined();
    expect(json.message).toBe('Connexion réussie');
  });

  it('retourne requires2FA: true si 2FA activé', async () => {
    (db.user.findUnique as any).mockResolvedValueOnce({ ...mockUser, twoFactorEnabled: true });
    const res = await POST(makeRequest({ email: mockUser.email, password: 'password123' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.requires2FA).toBe(true);
    expect(json.tempToken).toBeDefined();
  });
});
