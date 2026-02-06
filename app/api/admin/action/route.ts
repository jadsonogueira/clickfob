import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function normalizeStatus(v: string) {
  const s = String(v || "").toLowerCase();
  if (s === "confirmed" || s === "cancelled") return s;
  return "";
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const order = (url.searchParams.get("order") || "").toUpperCase();
    const status = normalizeStatus(url.searchParams.get("status") || "");
    const secret = url.searchParams.get("secret") || "";

    const expected = process.env.ADMIN_ACTION_SECRET || "";

    if (!order || !status) {
      return NextResponse.redirect(new URL(`/admin/action-result?ok=0&msg=Missing+params`, url.origin));
    }

    if (!expected || secret !== expected) {
      return NextResponse.redirect(new URL(`/admin/action-result?ok=0&msg=Unauthorized`, url.origin));
    }

    const booking = await prisma.booking.findUnique({ where: { orderNumber: order } });

    if (!booking) {
      return NextResponse.redirect(new URL(`/admin/action-result?ok=0&msg=Booking+not+found`, url.origin));
    }

    await prisma.booking.update({
      where: { orderNumber: order },
      data: { status },
    });

    return NextResponse.redirect(
      new URL(`/admin/action-result?ok=1&order=${encodeURIComponent(order)}&status=${encodeURIComponent(status)}`, url.origin)
    );
  } catch (err) {
    console.error("Admin action error:", err);
    // fallback: manda pra uma página simples
    return NextResponse.redirect(new URL(`/admin/action-result?ok=0&msg=Server+error`, new URL(request.url).origin));
  }
}
