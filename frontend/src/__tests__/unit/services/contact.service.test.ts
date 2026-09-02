import { describe, it, expect, vi } from 'vitest';
/**
 * Unit tests — contact.service.ts
 */
import { makeContact } from "../../setup/mocks";

vi.mock("@/backend/db", () => ({
  db: {
    user: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
    article: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn(), aggregate: vi.fn() },
    category: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    comment: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
    like: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), delete: vi.fn(), count: vi.fn() },
    notification: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    socialContact: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    pushSubscription: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  },
}));

import { db } from "@/backend/db";

import {
  getPublicContacts, getAllContacts, createContact, updateContact,
  deleteContact, toggleContact, reorderContacts,
} from "@/backend/services/contact.service";
import { ValidationError, NotFoundError } from "@/backend/utils/auth";

describe("getPublicContacts", () => {
  it("filters isActive=true ordered by order asc", async () => {
    (db.socialContact.findMany as any).mockResolvedValue([makeContact()]);
    await getPublicContacts();
    expect(db.socialContact.findMany).toHaveBeenCalledWith({ where: { isActive: true }, orderBy: { order: "asc" } });
  });
});

describe("getAllContacts", () => {
  it("returns all contacts without filter", async () => {
    (db.socialContact.findMany as any).mockResolvedValue([makeContact(), makeContact({ id: "c2", isActive: false })]);
    const r = await getAllContacts();
    expect(r).toHaveLength(2);
  });
});

describe("createContact", () => {
  it("defaults isActive=true order=0", async () => {
    (db.socialContact.create as any).mockResolvedValue(makeContact());
    await createContact({ platform: "wa", label: "WA", url: "https://wa.me" });
    const d = (db.socialContact.create as any).mock.calls[0][0].data;
    expect(d.isActive).toBe(true);
    expect(d.order).toBe(0);
  });

  it("respects custom order and isActive", async () => {
    (db.socialContact.create as any).mockResolvedValue(makeContact({ isActive: false, order: 5 }));
    await createContact({ platform: "tiktok", label: "TT", url: "https://tt.com", isActive: false, order: 5 });
    const d = (db.socialContact.create as any).mock.calls[0][0].data;
    expect(d.isActive).toBe(false);
    expect(d.order).toBe(5);
  });
});

describe("toggleContact", () => {
  it("active → inactive", async () => {
    (db.socialContact.findUnique as any).mockResolvedValue(makeContact({ isActive: true }));
    (db.socialContact.update as any).mockResolvedValue(makeContact({ isActive: false }));
    const r = await toggleContact("c1");
    expect(r.isActive).toBe(false);
  });

  it("inactive → active", async () => {
    (db.socialContact.findUnique as any).mockResolvedValue(makeContact({ isActive: false }));
    (db.socialContact.update as any).mockResolvedValue(makeContact({ isActive: true }));
    const r = await toggleContact("c1");
    expect(r.isActive).toBe(true);
  });

  it("throws NotFoundError for unknown id", async () => {
    (db.socialContact.findUnique as any).mockResolvedValue(null);
    await expect(toggleContact("ghost")).rejects.toThrow(NotFoundError);
  });
});

describe("reorderContacts", () => {
  it("assigns index as order for each id", async () => {
    const ids = ["c1", "c2", "c3"];
    (db.socialContact.findMany as any).mockResolvedValue(ids.map((id) => ({ id })));
    (db.socialContact.update as any).mockResolvedValue({});
    (db.$transaction as any).mockImplementation((ops: unknown[]) => Promise.all(ops));

    await reorderContacts(ids);
    expect(db.socialContact.update).toHaveBeenCalledTimes(3);
    expect((db.socialContact.update as any).mock.calls[0][0].data).toEqual({ order: 0 });
    expect((db.socialContact.update as any).mock.calls[2][0].data).toEqual({ order: 2 });
  });

  it("throws ValidationError for duplicate IDs", async () => {
    await expect(reorderContacts(["c1", "c1"])).rejects.toThrow(ValidationError);
  });

  it("throws NotFoundError when id not in DB", async () => {
    (db.socialContact.findMany as any).mockResolvedValue([{ id: "c1" }]);
    await expect(reorderContacts(["c1", "missing"])).rejects.toThrow(NotFoundError);
  });
});

describe("deleteContact", () => {
  it("deletes by id", async () => {
    (db.socialContact.delete as any).mockResolvedValue({ id: "c1" });
    await deleteContact("c1");
    expect(db.socialContact.delete).toHaveBeenCalledWith({ where: { id: "c1" } });
  });
});

describe("updateContact", () => {
  it("updates label", async () => {
    (db.socialContact.update as any).mockResolvedValue(makeContact({ label: "New" }));
    await updateContact("c1", { label: "New" });
    expect((db.socialContact.update as any).mock.calls[0][0].data).toMatchObject({ label: "New" });
  });
});
