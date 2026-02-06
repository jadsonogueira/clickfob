// app/api/admin/bookings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const token = req.headers
    .get("cookie")
    ?.split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${ADMIN_COOKIE_NAME}=`))
    ?.split("=")[1];

  if (!verifyAdminSessionToken(token).ok) {
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
