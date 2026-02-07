// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "clickfob_admin";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ NÃO proteger a página de login
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // ✅ Proteger somente o dashboard/admin real
  if (pathname.startsWith("/admin")) {
    const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value || "";
    const expected = String(process.env.ADMIN_DASHBOARD_KEY || "").trim();

    if (!expected || cookie !== expected) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
