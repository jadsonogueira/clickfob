import crypto from "crypto";

type AdminAction = "confirm" | "cancel";

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(secret: string, payload: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function createAdminActionToken(params: {
  orderNumber: string;
  action: AdminAction;
  expiresInSeconds?: number;
}) {
  const secret = process.env.ADMIN_ACTION_SECRET;
  if (!secret) {
    throw new Error("Missing ADMIN_ACTION_SECRET");
  }

  const expiresInSeconds = params.expiresInSeconds ?? 60 * 60 * 24 * 7; // 7 dias
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;

  const payload = `${params.orderNumber}.${params.action}.${exp}`;
  const payloadB64 = base64UrlEncode(payload);
  const signature = sign(secret, payloadB64);

  return `${payloadB64}.${signature}`;
}

export function verifyAdminActionToken(token: string) {
  const secret = process.env.ADMIN_ACTION_SECRET;
  if (!secret) return { ok: false as const, error: "Missing ADMIN_ACTION_SECRET" };

  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false as const, error: "Invalid token format" };

  const [payloadB64, signature] = parts;
  const expected = sign(secret, payloadB64);

  // timing-safe compare
  const sigBuf = Buffer.from(signature, "hex");
  const expBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expBuf.length) {
    return { ok: false as const, error: "Invalid token signature" };
  }
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { ok: false as const, error: "Invalid token signature" };
  }

  const payload = base64UrlDecode(payloadB64);
  const [orderNumber, action, expStr] = payload.split(".");
  if (!orderNumber || (action !== "confirm" && action !== "cancel") || !expStr) {
    return { ok: false as const, error: "Invalid token payload" };
  }

  const exp = Number(expStr);
  if (!Number.isFinite(exp)) return { ok: false as const, error: "Invalid token expiration" };

  const now = Math.floor(Date.now() / 1000);
  if (now > exp) return { ok: false as const, error: "Token expired" };

  return {
    ok: true as const,
    orderNumber,
    action: action as AdminAction,
    exp,
  };
}
