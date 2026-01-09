import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json(
        { success: false, error: "Date is required" },
        { status: 400 }
      );
    }

    const date = new Date(dateStr);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const bookings = await prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: "cancelled" },
      },
      select: {
        bookingTime: true,
      },
    });

    const bookedSlots = bookings?.map((b: { bookingTime: string }) => b?.bookingTime) ?? [];

    return NextResponse.json({
      success: true,
      bookedSlots,
    });
  } catch (error) {
    console.error("Availability check error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check availability", bookedSlots: [] },
      { status: 500 }
    );
  }
}
