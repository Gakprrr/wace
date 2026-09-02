/**
 * Shared mock factories and test helpers.
 * Import this file AFTER jest.mock() declarations in test files.
 */
import { Role, ItemState, NotificationType } from "@prisma/client";

// ── Mock DB (stateless factory — call makeMockDb() per test file) ─────────────
export function makeMockDb() {
  return {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    article: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    comment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    like: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    notification: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    socialContact: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    pushSubscription: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((ops: unknown[]) => Promise.all(ops)),
  };
}

// ── Fixture factories ─────────────────────────────────────────────────────────

export const makeUser = (overrides: Record<string, unknown> = {}) => ({
  id: "user-1",
  email: "test@wace.com",
  name: "Test User",
  password: "$2a$12$hashedpassword",
  phone: "+22890000001",
  avatar: null,
  role: Role.CLIENT as Role,
  emailVerified: null,
  twoFactorEnabled: false,
  twoFactorSecret: null,
  isActive: true,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  ...overrides,
});

export const makeAdmin = (overrides: Record<string, unknown> = {}) =>
  makeUser({ id: "admin-1", email: "admin@wace.com", role: Role.ADMIN, ...overrides });

export const makeArticle = (overrides: Record<string, unknown> = {}) => ({
  id: "article-1",
  title: "Chemise Oxford",
  description: "Belle chemise vintage",
  price: { toString: () => "3500", toNumber: () => 3500 },
  oldPrice: null,
  stock: 5,
  state: ItemState.BON_ETAT,
  images: ["https://res.cloudinary.com/wace/image/upload/test.jpg"],
  categoryId: "cat-1",
  isAvailable: true,
  isNew: false,
  views: 10,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  category: { id: "cat-1", name: "Vêtements Homme", slug: "vetements-homme" },
  _count: { likes: 2, comments: 1 },
  comments: [],
  ...overrides,
});

export const makeCategory = (overrides: Record<string, unknown> = {}) => ({
  id: "cat-1",
  name: "Vêtements Homme",
  slug: "vetements-homme",
  icon: "👔",
  articles: [],
  _count: { articles: 2 },
  ...overrides,
});

export const makeComment = (overrides: Record<string, unknown> = {}) => ({
  id: "comment-1",
  content: "Super article !",
  rating: 5,
  userId: "user-1",
  articleId: "article-1",
  createdAt: new Date("2025-01-01"),
  user: { id: "user-1", name: "Test User", avatar: null },
  ...overrides,
});

export const makeContact = (overrides: Record<string, unknown> = {}) => ({
  id: "contact-1",
  platform: "whatsapp",
  label: "WhatsApp WACE",
  url: "https://wa.me/22890000000",
  icon: "💬",
  isActive: true,
  order: 0,
  ...overrides,
});

export const makeNotification = (overrides: Record<string, unknown> = {}) => ({
  id: "notif-1",
  title: "Nouvel article",
  message: "Découvrez notre nouveau produit",
  type: NotificationType.ARTICLE_ADDED,
  userId: "user-1",
  isRead: false,
  data: null,
  createdAt: new Date("2025-01-01"),
  ...overrides,
});

// ── Token payloads ────────────────────────────────────────────────────────────

export const CLIENT_PAYLOAD = {
  userId: "user-1",
  email: "test@wace.com",
  role: Role.CLIENT,
  twoFactorVerified: true,
};

export const ADMIN_PAYLOAD = {
  userId: "admin-1",
  email: "admin@wace.com",
  role: Role.ADMIN,
  twoFactorVerified: true,
};

// ── Request builder ───────────────────────────────────────────────────────────

export function makeRequest(
  method: string,
  url: string,
  options: { body?: unknown; headers?: Record<string, string>; token?: string } = {}
): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...options.headers };
  if (options.token) headers["Authorization"] = `Bearer ${options.token}`;

  return new Request(`http://localhost${url}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}
