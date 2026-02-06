// app/api/admin/booking/[orderNumber]/route.ts
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
  return found.slice(name.length + 1); // NÃO usa split("=") pra não truncar token com "="
}

function normalizeOrderNumber(input: string) {
  return String(input || "").trim().toUpperCase();
}

export async function GET(
  req: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const token = getCookieValue(req.headers.get("cookie"), ADMIN_COOKIE_NAME);

    if (!verifyAdminSessionToken(token).ok) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const orderNumber = normalizeOrderNumber(params.orderNumber);

    const booking = await prisma.booking.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        orderNumber: true,

        serviceType: true,
        servicePrice: true,

        bookingDate: true,
        bookingTime: true,

        customerName: true,
        customerEmail: true,
        customerWhatsapp: true,

        customerAddress: true,
        customerUnit: true,

        additionalNotes: true,

        photoFrontUrl: true,
        photoBackUrl: true,

        status: true,

        createdAt: true,
        updatedAt: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, booking });
  } catch (err: any) {
    console.error("Admin booking details error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
