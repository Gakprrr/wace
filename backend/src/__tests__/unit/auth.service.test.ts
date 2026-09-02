import { describe, it, expect, vi } from 'vitest';
/**
 * Tests unitaires — auth.service.ts
 * Vérifie: hashPassword, comparePassword, generateToken, verifyToken
 */
import { hashPassword, comparePassword, generateToken, verifyToken } from '@/services/auth.service';

// On mock la DB pour ne pas toucher PostgreSQL dans les tests unitaires
vi.mock('@/db', () => ({
  db: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('AuthService — hashPassword / comparePassword', () => {
  it('hashe un mot de passe et le vérifie correctement', async () => {
    const plain = 'MonMotDePasse123!';
    const hash = await hashPassword(plain);

    expect(hash).not.toBe(plain);
    expect(hash.startsWith('$2')).toBe(true); // bcrypt prefix
    const match = await comparePassword(plain, hash);
    expect(match).toBe(true);
  });

  it('retourne false pour un mauvais mot de passe', async () => {
    const hash = await hashPassword('correct');
    const match = await comparePassword('wrong', hash);
    expect(match).toBe(false);
  });
});

describe('AuthService — JWT generateToken / verifyToken', () => {
  const payload = { userId: 'user-123', email: 'test@wace.com', role: 'CLIENT' as any };

  it('génère un token JWT valide', async () => {
    const token = await generateToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // header.payload.signature
  });

  it('vérifie un token JWT et retourne le payload', async () => {
    const token = await generateToken(payload);
    const decoded = await verifyToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.email).toBe(payload.email);
    expect(decoded?.role).toBe(payload.role);
  });

  it('retourne null pour un token invalide', async () => {
    const result = await verifyToken('token.invalide.faux');
    expect(result).toBeNull();
  });

  it('retourne null pour un token expiré', async () => {
    const token = await generateToken(payload, '1ms');
    await new Promise((r) => setTimeout(r, 10)); // attendre expiration
    const result = await verifyToken(token);
    expect(result).toBeNull();
  });
});
