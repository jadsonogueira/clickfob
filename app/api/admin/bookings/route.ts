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

export async function GET(req: Request) {
  const token = getCookieValue(req.headers.get("cookie"), ADMIN_COOKIE_NAME);

  if (!verifyAdminSessionToken(token).ok) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = (url.searchParams.get("status") || "all").toLowerCase();
  const qRaw = (url.searchParams.get("q") || "").trim();
  const q = qRaw.length ? qRaw : "";

  const statusWhere =
    status === "all"
      ? {}
      : {
          status: status as any,
        };

  const searchWhere =
    q.length === 0
      ? {}
      : {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" as any } },
            { customerName: { contains: q, mode: "insensitive" as any } },
            { customerEmail: { contains: q, mode: "insensitive" as any } },
          ],
        };

  const where = {
    ...statusWhere,
    ...searchWhere,
  };

  const [bookings, pendingCount, confirmedCount, cancelledCount, totalCount] =
    await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: "desc" as any },
        take: 200,
      }),
      prisma.booking.count({ where: { status: "pending" as any } }),
      prisma.booking.count({ where: { status: "confirmed" as any } }),
      prisma.booking.count({ where: { status: "cancelled" as any } }),
      prisma.booking.count(),
    ]);

  return NextResponse.json({
    ok: true,
    bookings,
    counts: {
      pending: pendingCount,
      confirmed: confirmedCount,
      cancelled: cancelledCount,
      total: totalCount,
    },
  });
}
