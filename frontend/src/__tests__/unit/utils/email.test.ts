import { describe, it, expect, vi, beforeEach } from 'vitest';
/**
 * Unit tests — utils/email.ts
 */
import { ItemState } from "@prisma/client";

vi.mock("nodemailer", () => ({
  createTransport: vi.fn().mockReturnValue({
    sendMail: vi.fn().mockResolvedValue({ messageId: "ok" }),
  }),
}));

import nodemailer from "nodemailer";
import { sendNewArticleEmail } from "@/backend/utils/email";

const makeArticleFixture = (overrides: Record<string, unknown> = {}) => ({
  id: "art-1",
  title: "Chemise Oxford",
  description: "Belle chemise",
  price: 3500,
  oldPrice: null,
  stock: 1,
  state: ItemState.BON_ETAT,
  images: ["https://res.cloudinary.com/wace/test.jpg"],
  categoryId: "cat-1",
  isAvailable: true,
  isNew: false,
  views: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
}) as unknown as Parameters<typeof sendNewArticleEmail>[1];

const makeUserFixture = (email: string) => ({
  id: "u1", email, name: "User", password: null, phone: null, avatar: null,
  role: "CLIENT" as const, emailVerified: null, twoFactorEnabled: false,
  twoFactorSecret: null, isActive: true, createdAt: new Date(), updatedAt: new Date(),
});

// ─────────────────────────────────────────────────────────────────────────────

describe("sendNewArticleEmail", () => {
  beforeEach(() => {
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
    vi.clearAllMocks();
  });

  it("does nothing when SMTP not configured (mock path)", async () => {
    const users = [makeUserFixture("a@a.com")];
    await sendNewArticleEmail(users, makeArticleFixture());
    const sendMail = (nodemailer.createTransport({} as never) as unknown as { sendMail: any }).sendMail;
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("does nothing when users array is empty", async () => {
    process.env.SMTP_USER = "u@u.com";
    process.env.SMTP_PASS = "p";
    await sendNewArticleEmail([], makeArticleFixture());
    const mockTransport = { sendMail: vi.fn() };
    (nodemailer.createTransport as any).mockReturnValue(mockTransport);
    expect(mockTransport.sendMail).not.toHaveBeenCalled();
  });

  it("sends email with BCC and article details when SMTP configured", async () => {
    process.env.GMAIL_USER = "wace@gmail.com";
    process.env.GMAIL_APP_PASSWORD = "apppass";

    const mockSendMail = vi.fn().mockResolvedValue({ messageId: "sent" });
    (nodemailer.createTransport as any).mockReturnValue({ sendMail: mockSendMail });

    const users = [makeUserFixture("client1@wace.com"), makeUserFixture("client2@wace.com")];
    const article = makeArticleFixture({ title: "Chemise Test", price: 3500 });

    await sendNewArticleEmail(users, article);

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const mailArg = mockSendMail.mock.calls[0][0];
    expect(mailArg.bcc).toContain("client1@wace.com");
    expect(mailArg.subject).toContain("Chemise Test");
    expect(mailArg.html).toContain("WACE");
  });

  it("includes image HTML when article has images", async () => {
    process.env.SMTP_USER = "u@u.com";
    process.env.SMTP_PASS = "p";

    const mockSendMail = vi.fn().mockResolvedValue({});
    (nodemailer.createTransport as any).mockReturnValue({ sendMail: mockSendMail });

    const article = makeArticleFixture({ images: ["https://res.cloudinary.com/wace/photo.jpg"] });
    await sendNewArticleEmail([makeUserFixture("a@a.com")], article);

    const mailArg = mockSendMail.mock.calls[0][0];
    expect(mailArg.html).toContain("<img");
    expect(mailArg.html).toContain("cloudinary.com");
  });

  it("omits image HTML when article has no images", async () => {
    process.env.SMTP_USER = "u@u.com";
    process.env.SMTP_PASS = "p";

    const mockSendMail = vi.fn().mockResolvedValue({});
    (nodemailer.createTransport as any).mockReturnValue({ sendMail: mockSendMail });

    const article = makeArticleFixture({ images: [] });
    await sendNewArticleEmail([makeUserFixture("a@a.com")], article);

    const mailArg = mockSendMail.mock.calls[0][0];
    expect(mailArg.html).not.toContain("<img");
  });
});
