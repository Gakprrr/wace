import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeRequest } from "../setup/mocks";
import { GET as adminUsersHandler } from "@/app/api/admin/users/route";
import { Role } from "@prisma/client";
import { generateToken } from "@/services/auth.service";

describe("Security & Authorization Tests", () => {
  it("should block unauthenticated access to admin routes with 401", async () => {
    const res = await adminUsersHandler(makeRequest("GET", "/api/admin/users"));
    expect(res.status).toBe(401);
  });

  it("should block authenticated non-admin users from admin routes with 403", async () => {
    const token = await generateToken({ userId: "user-1", email: "client@wace.com", role: Role.CLIENT });
    const res = await adminUsersHandler(makeRequest("GET", "/api/admin/users", { token }));
    expect(res.status).toBe(403);
  });
});
