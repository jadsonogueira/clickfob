// app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createAdminSessionToken } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const key = String(body?.key || "");

    const expected = process.env.ADMIN_DASHBOARD_KEY || "";
    if (!expected) {
      return NextResponse.json(
        { ok: false, error: "Missing ADMIN_DASHBOARD_KEY on server" },
        { status: 500 }
      );
    }

    if (!key || key !== expected) {
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
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Login failed" },
      { status: 500 }
    );
  }
}
