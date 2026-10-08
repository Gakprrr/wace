import { describe, it, expect, vi } from 'vitest';
/**
 * API Route tests — /api/admin/upload
 */
import { Role } from "@prisma/client";
import { generateToken } from "@/backend/services/auth.service";

vi.mock("@/backend/db", () => ({ db: {} }));
vi.mock("@/backend/services/upload.service", () => ({
  uploadImage: vi.fn().mockResolvedValue("https://res.cloudinary.com/wace/image/upload/v1/test.jpg"),
}));

import { uploadImage } from "@/backend/services/upload.service";
import { POST as uploadHandler } from "@/app/api/admin/upload/route";

function makeFormRequest(token: string, file?: File): Request {
  const formData = new FormData();
  if (file) formData.append("file", file);

  return new Request("http://localhost/api/admin/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
}

// ─────────────────────────────────────────────────────────────────────────────

describe("POST /api/admin/upload", () => {
  it("returns 401 without auth", async () => {
    const req = new Request("http://localhost/api/admin/upload", { method: "POST" });
    const res = await uploadHandler(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 for CLIENT role", async () => {
    const token = await generateToken({ userId: "u1", email: "u@u.com", role: Role.CLIENT });
    const req = makeFormRequest(token);
    const res = await uploadHandler(req);
    expect(res.status).toBe(403);
  });

  it("returns 400 when no file in form data (admin)", async () => {
    const token = await generateToken({ userId: "a1", email: "a@a.com", role: Role.ADMIN });
    const req = makeFormRequest(token); // no file appended
    const res = await uploadHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/fichier/i);
  });

  it("returns 200 with secureUrl on success (admin)", async () => {
    const token = await generateToken({ userId: "a1", email: "a@a.com", role: Role.ADMIN });
    const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
    const req = makeFormRequest(token, file);

    const res = await uploadHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.secureUrl).toBe("https://res.cloudinary.com/wace/image/upload/v1/test.jpg");
  });

  it("returns 500 when uploadImage throws", async () => {
    (uploadImage as any).mockRejectedValueOnce(new Error("Cloudinary upload failed: timeout"));
    const token = await generateToken({ userId: "a1", email: "a@a.com", role: Role.ADMIN });
    const file = new File(["img"], "photo.jpg", { type: "image/jpeg" });
    const req = makeFormRequest(token, file);

    const res = await uploadHandler(req);
    expect(res.status).toBe(500);
  });
});
