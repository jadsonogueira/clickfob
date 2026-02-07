import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

  if (expected && token && token === expected) return true;
  if (verifyAdminSessionToken(token).ok) return true;

  return false;
}

function normalizeStatus(status: string) {
  const s = String(status || "").toLowerCase();
  if (s === "confirmed" || s === "cancelled" || s === "pending") return s;
  return "";
}

/**
 * ✅ GET usado pela página /admin/booking/[orderNumber]
 * Retorna { ok: true, booking }
 */
export async function GET(
  req: Request,
  { params }: { params: { orderNumber: string } }
) {
  const cookieHeader = req.headers.get("cookie");
  if (!isAdminAuthorized(cookieHeader)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const raw = decodeURIComponent(String(params?.orderNumber ?? "")).trim();
  if (!raw) {
    return NextResponse.json({ ok: false, error: "Order number is required" }, { status: 400 });
  }

  const upper = raw.toUpperCase();

  const booking = await prisma.booking.findFirst({
    where: {
      OR: [{ orderNumber: raw }, { orderNumber: upper }],
    },
  });

  if (!booking) {
    return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, booking });
}

/**
 * ✅ POST (mantido) — fluxo antigo de update com ADMIN_ACTION_SECRET
 * (se você ainda usa algum webhook/ação externa)
 */
export async function POST(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const orderNumber = String(params?.orderNumber ?? "").trim().toUpperCase();
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

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ orderNumber }, { orderNumber: orderNumber.toUpperCase() }],
      },
    });

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
      where: { orderNumber: booking.orderNumber },
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
