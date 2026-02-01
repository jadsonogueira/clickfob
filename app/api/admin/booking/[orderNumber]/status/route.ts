// app/api/admin/booking/[orderNumber]/status/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";
import { sendEmail, generateBookingStatusUpdateEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const timeSlotLabels: Record<string, string> = {
  "9-11": "9:00 AM - 11:00 AM",
  "11-13": "11:00 AM - 1:00 PM",
  "13-15": "1:00 PM - 3:00 PM",
  "15-17": "3:00 PM - 5:00 PM",
};

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return "";
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const hit = parts.find((p) => p.startsWith(`${name}=`));
  if (!hit) return "";
  return decodeURIComponent(hit.split("=").slice(1).join("="));
}

function getAppBaseUrl() {
  const a = process.env.NEXT_PUBLIC_APP_URL;
  const b = process.env.NEXTAUTH_URL;
  return (a || b || "http://localhost:3000").replace(/\/$/, "");
}

function normalizeStatus(v: unknown): "confirmed" | "cancelled" | "" {
  const s = String(v ?? "").toLowerCase().trim();
  if (s === "confirmed" || s === "cancelled") return s;
  return "";
}

export async function POST(
  req: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const token = getCookieValue(req.headers.get("cookie"), ADMIN_COOKIE_NAME);
    if (!verifyAdminSessionToken(token).ok) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const newStatus = normalizeStatus(body?.status);
    if (!newStatus) {
      return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
    }

    const orderNumber = (params.orderNumber || "").toUpperCase();
    if (!orderNumber) {
      return NextResponse.json({ ok: false, error: "Missing orderNumber" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { orderNumber },
    });

    if (!booking) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    // Se já está no status, retorna ok (idempotente)
    if (booking.status === newStatus) {
      return NextResponse.json({ ok: true, booking });
    }

    const now = new Date();

    const updated = await prisma.booking.update({
      where: { orderNumber },
      data: {
        status: newStatus,
        statusUpdatedAt: now,
        confirmedAt: newStatus === "confirmed" ? now : null,
        cancelledAt: newStatus === "cancelled" ? now : null,
      },
    });

    // Email para cliente
    const baseUrl = getAppBaseUrl();
    const manageUrl = `${baseUrl}/manage/${orderNumber}`;

    const formattedDate = new Date(updated.bookingDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeLabel = timeSlotLabels[updated.bookingTime] || updated.bookingTime;

    await sendEmail({
      to: updated.customerEmail,
      subject:
        newStatus === "confirmed"
          ? `ClickFob Booking Confirmed - Order #${orderNumber}`
          : `ClickFob Booking Cancelled - Order #${orderNumber}`,
      htmlBody: generateBookingStatusUpdateEmail({
        orderNumber,
        customerName: updated.customerName,
        status: newStatus,
        serviceName: updated.serviceType,
        bookingDate: formattedDate,
        bookingTime: timeLabel,
        manageUrl,
      }),
    });

    return NextResponse.json({ ok: true, booking: updated });
  } catch (err: any) {
    console.error("Admin status update error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
