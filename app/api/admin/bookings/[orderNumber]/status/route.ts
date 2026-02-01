import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function normalizeStatus(status: string) {
  const s = String(status || "").toLowerCase();
  if (s === "confirmed" || s === "cancelled" || s === "pending") return s;
  return "";
}

export async function POST(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const orderNumber = params?.orderNumber?.toUpperCase();
    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "Order number is required" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const nextStatus = normalizeStatus(body?.status);

    if (!nextStatus || (nextStatus !== "confirmed" && nextStatus !== "cancelled")) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    const secret = String(body?.secret || "");
    const expected = String(process.env.ADMIN_ACTION_SECRET || "");

    if (!expected || secret !== expected) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const booking = await prisma.booking.findUnique({ where: { orderNumber } });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status === nextStatus) {
      return NextResponse.json({ success: true, already: true });
    }

    await prisma.booking.update({
      where: { orderNumber },
      data: { status: nextStatus },
    });

    return NextResponse.json({ success: true, status: nextStatus });
  } catch (err) {
    console.error("Admin status update error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update status" },
      { status: 500 }
    );
  }
}
