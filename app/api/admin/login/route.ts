// app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createAdminSessionToken } from "@/lib/admin-auth";
import crypto from "crypto";

export const runtime = "nodejs";

function timingSafeEqualStr(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ sempre normaliza entrada
    const key = String(body?.key ?? "").trim();

    // ✅ normaliza env (remove espaços/aspas acidentais)
    const rawExpected = String(process.env.ADMIN_DASHBOARD_KEY ?? "");
    const expected = rawExpected.trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");

    if (!expected) {
      return NextResponse.json(
        { ok: false, error: "Missing ADMIN_DASHBOARD_KEY on server" },
        { status: 500 }
      );
    }

    if (!key || !timingSafeEqualStr(key, expected)) {
      return NextResponse.json({ ok: false, error: "Invalid key" }, { status: 401 });
    }

    const token = createAdminSessionToken(); // 8h
    const res = NextResponse.json({ ok: true });

    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
}
