// app/api/admin/bookings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const found = parts.find((p) => p.startsWith(`${name}=`));
  if (!found) return null;
  return found.slice(name.length + 1);
}

// ✅ aceita cookie simples (igual à env) OU token assinado (modelo novo)
function isAdminAuthorized(cookieHeader: string | null) {
  const token = getCookieValue(cookieHeader, ADMIN_COOKIE_NAME);
  const expected = String(process.env.ADMIN_DASHBOARD_KEY || "").trim();

  // modo antigo (backup): cookie == ADMIN_DASHBOARD_KEY
  if (expected && token && token === expected) return true;

  // modo novo: cookie é token assinado
  if (verifyAdminSessionToken(token).ok) return true;

  return false;
}

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie");

  if (!isAdminAuthorized(cookieHeader)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "all";

  const where =
    status === "all"
      ? {}
      : {
          status: status as any,
        };

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" as any },
    take: 200,
  });

  return NextResponse.json({ ok: true, bookings });
}