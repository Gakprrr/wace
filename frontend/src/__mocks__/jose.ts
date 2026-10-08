/**
 * Manual CJS mock for jose (ESM-only in v6).
 * Implements real JWT sign/verify using Node.js crypto — no external deps.
 * This allows unit tests using generateToken/verifyToken to work without ESM.
 */
import crypto from "crypto";

const ALG = "HS256";

function base64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function sign(payload: Record<string, unknown>, secret: Uint8Array, expiresIn?: string): string {
  const header = base64url(JSON.stringify({ alg: ALG, typ: "JWT" }));

  // Parse expiry — supports ms, s, m, h, d units
  let exp: number | undefined;
  if (expiresIn) {
    const match = expiresIn.match(/^(\d+)(ms|s|m|h|d)?$/);
    if (match) {
      const val = parseInt(match[1]);
      const unit = match[2] || "s";
      if (unit === "ms") {
        // Store as fractional seconds — 1ms → exp set to past immediately
        exp = Date.now() / 1000 + val / 1000;
      } else {
        const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
        exp = Math.floor(Date.now() / 1000) + val * (multipliers[unit] ?? 1);
      }
    }
  }

  const claims = { ...payload, iat: Math.floor(Date.now() / 1000), ...(exp ? { exp } : {}) };
  const body = base64url(JSON.stringify(claims));

  const sigInput = `${header}.${body}`;
  const sig = base64url(
    crypto.createHmac("sha256", Buffer.from(secret)).update(sigInput).digest()
  );

  return `${sigInput}.${sig}`;
}

function verify(token: string, secret: Uint8Array): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");

  const [headerB64, bodyB64, sigB64] = parts;
  const expectedSig = base64url(
    crypto.createHmac("sha256", Buffer.from(secret)).update(`${headerB64}.${bodyB64}`).digest()
  );

  if (sigB64 !== expectedSig) throw new Error("JWT signature verification failed");

  const payload = JSON.parse(Buffer.from(bodyB64, "base64").toString("utf8")) as Record<string, unknown>;

  if (payload.exp !== undefined && typeof payload.exp === "number") {
    if (payload.exp < Date.now() / 1000) {
      throw new Error("JWT expired");
    }
  }

  return payload;
}

// ── SignJWT class ─────────────────────────────────────────────────────────────

class SignJWT {
  private _payload: Record<string, unknown>;
  private _header: Record<string, unknown> = {};
  private _expiresIn?: string;

  constructor(payload: Record<string, unknown>) {
    this._payload = payload;
  }

  setProtectedHeader(header: Record<string, unknown>) {
    this._header = header;
    return this;
  }

  setIssuedAt() {
    return this; // handled in sign()
  }

  setExpirationTime(exp: string) {
    this._expiresIn = exp;
    return this;
  }

  async sign(secret: Uint8Array): Promise<string> {
    return sign(this._payload, secret, this._expiresIn);
  }
}

async function jwtVerify(token: string, secret: Uint8Array) {
  const payload = verify(token, secret);
  return { payload };
}

module.exports = { SignJWT, jwtVerify };
