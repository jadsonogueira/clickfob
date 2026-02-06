// lib/admin-auth.ts
import crypto from "crypto";

const COOKIE_NAME = "clickfob_admin";

function getSecret() {
  const secret = process.env.ADMIN_DASHBOARD_KEY;
  if (!secret) throw new Error("Missing ADMIN_DASHBOARD_KEY");
  return secret;
}

function base64url(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function sign(data: string) {
  const secret = getSecret();
  const h = crypto.createHmac("sha256", secret).update(data).digest();
  return base64url(h);
}

export function createAdminSessionToken(ttlSeconds = 60 * 60 * 8) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + ttlSeconds;
  const payload = `admin.${exp}`;
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined | null) {
  if (!token) return { ok: false as const, reason: "missing" };
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false as const, reason: "format" };

  const [role, expStr, sig] = parts;
  if (role !== "admin") return { ok: false as const, reason: "role" };

  const exp = Number(expStr);
  if (!Number.isFinite(exp)) return { ok: false as const, reason: "exp" };

  const now = Math.floor(Date.now() / 1000);
  if (now > exp) return { ok: false as const, reason: "expired" };

  const payload = `${role}.${expStr}`;
  const expected = sign(payload);

  // timing-safe compare
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length) return { ok: false as const, reason: "sig" };
  if (!crypto.timingSafeEqual(a, b)) return { ok: false as const, reason: "sig" };

  return { ok: true as const };
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
