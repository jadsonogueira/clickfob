// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Libera login e assets do Next
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname.startsWith("/_next")) return NextResponse.next();
  if (pathname.startsWith("/favicon")) return NextResponse.next();

  // Protege tudo que começa com /admin
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const ok = verifyAdminSessionToken(token).ok;

    if (!ok) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
