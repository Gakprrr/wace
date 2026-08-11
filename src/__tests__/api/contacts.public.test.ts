import { describe, it, expect, vi } from 'vitest';
/**
 * API Route tests — /api/contacts (public endpoint)
 */
import { makeMockDb, makeContact, makeRequest } from "../setup/mocks";

const db = makeMockDb();
vi.mock("@/backend/db", () => ({ db }));

import { GET as getContactsHandler } from "@/app/api/contacts/route";

describe("GET /api/contacts", () => {
  it("returns only active contacts (no auth required)", async () => {
    (db.socialContact.findMany as any).mockResolvedValue([
      makeContact({ isActive: true }),
      makeContact({ id: "c2", isActive: true }),
    ]);
    const res = await getContactsHandler();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
  });

  it("returns empty array when no active contacts", async () => {
    (db.socialContact.findMany as any).mockResolvedValue([]);
    const res = await getContactsHandler();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});
