import { describe, it, expect, vi } from 'vitest';
/**
 * Unit tests — twoFactor.ts
 * Tests: generate2FASecret, verify2FAToken, save2FASecret, confirm2FA, disable2FA
 */
vi.mock("@/backend/db", () => ({
  db: {
    user: { update: vi.fn() },
  },
}));
vi.mock("speakeasy", () => ({
  generateSecret: vi.fn().mockReturnValue({
    base32: "BASE32SECRETKEY",
    otpauth_url: "otpauth://totp/WACE:test%40wace.com?secret=BASE32SECRETKEY&issuer=WACE",
  }),
  totp: {
    verify: vi.fn(),
  },
}));
vi.mock("qrcode", () => ({
  toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,fakeqrcode"),
}));

import { db } from "@/backend/db";

import speakeasy from "speakeasy";
import {
  generate2FASecret,
  verify2FAToken,
  save2FASecret,
  confirm2FA,
  disable2FA,
} from "@/backend/services/twoFactor";

// ─────────────────────────────────────────────────────────────────────────────

describe("generate2FASecret", () => {
  it("returns base32 secret and QR code data URL", async () => {
    const result = await generate2FASecret("test@wace.com");
    expect(result.secret).toBe("BASE32SECRETKEY");
    expect(result.qrCode).toMatch(/^data:image\/png;base64,/);
  });

  it("includes email in the secret name", async () => {
    await generate2FASecret("user@wace.com");
    const callArg = (speakeasy.generateSecret as any).mock.calls[0][0];
    expect(callArg.name).toContain("user@wace.com");
    expect(callArg.issuer).toBe("WACE — Wear The Energy");
  });

  it("throws when otpauth_url is missing", async () => {
    (speakeasy.generateSecret as any).mockReturnValueOnce({
      base32: "SECRET",
      otpauth_url: undefined,
    });
    await expect(generate2FASecret("bad@wace.com")).rejects.toThrow("Failed to generate OTP auth URL");
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("verify2FAToken", () => {
  it("returns true for valid TOTP token", () => {
    (speakeasy.totp.verify as any).mockReturnValue(true);
    expect(verify2FAToken("BASE32SECRET", "123456")).toBe(true);
  });

  it("returns false for invalid TOTP token", () => {
    (speakeasy.totp.verify as any).mockReturnValue(false);
    expect(verify2FAToken("BASE32SECRET", "000000")).toBe(false);
  });

  it("passes correct params to speakeasy", () => {
    (speakeasy.totp.verify as any).mockReturnValue(true);
    verify2FAToken("MYSECRET", "654321");
    expect(speakeasy.totp.verify).toHaveBeenCalledWith(
      expect.objectContaining({ secret: "MYSECRET", token: "654321", encoding: "base32", window: 2 })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("save2FASecret", () => {
  it("updates user with secret but does NOT enable 2FA", async () => {
    (db.user.update as any).mockResolvedValue({ id: "u1", twoFactorSecret: "SECRET", twoFactorEnabled: false });
    await save2FASecret("u1", "BASE32SECRET");
    const data = (db.user.update as any).mock.calls[0][0].data;
    expect(data.twoFactorSecret).toBe("BASE32SECRET");
    expect(data.twoFactorEnabled).toBeUndefined(); // must NOT be set here
  });
});

describe("confirm2FA", () => {
  it("sets twoFactorEnabled=true", async () => {
    (db.user.update as any).mockResolvedValue({ id: "u1", twoFactorEnabled: true });
    await confirm2FA("u1");
    expect((db.user.update as any).mock.calls[0][0].data).toEqual({ twoFactorEnabled: true });
  });
});

describe("disable2FA", () => {
  it("sets twoFactorEnabled=false and clears secret", async () => {
    (db.user.update as any).mockResolvedValue({ id: "u1", twoFactorEnabled: false, twoFactorSecret: null });
    await disable2FA("u1");
    const data = (db.user.update as any).mock.calls[0][0].data;
    expect(data.twoFactorEnabled).toBe(false);
    expect(data.twoFactorSecret).toBeNull();
  });
});
