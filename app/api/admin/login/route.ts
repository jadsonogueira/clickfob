// app/api/admin/login/route.ts
import { NextResponse } from "next/server";

const COOKIE_NAME = "clickfob_admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const key = String(body?.key || "").trim();
    const expected = String(process.env.ADMIN_DASHBOARD_KEY || "").trim();

    if (!expected) {
      return NextResponse.json(
        { ok: false, error: "ADMIN_DASHBOARD_KEY not configured" },
        { status: 500 }
      );
    }

    if (!key || key !== expected) {
      return NextResponse.json(
        { ok: false, error: "Invalid key" },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true });

    res.cookies.set(COOKIE_NAME, expected, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8h
    });

    return res;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Bad request" },
      { status: 400 }
    );
  }
}
