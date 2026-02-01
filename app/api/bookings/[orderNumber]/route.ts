import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
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

    const booking = await prisma.booking.findUnique({
      where: { orderNumber },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // ✅ Agora são URLs diretas (Cloudinary), então devolve direto:
    return NextResponse.json({
      success: true,
      booking: {
        orderNumber: booking.orderNumber,
        serviceType: booking.serviceType,
        servicePrice: booking.servicePrice,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        customerName: booking.customerName,
        customerAddress: booking.customerAddress,
        customerUnit: booking.customerUnit,
        customerEmail: booking.customerEmail,
        status: booking.status,
        photoFrontUrl: booking.photoFrontUrl,
        photoBackUrl: booking.photoBackUrl,
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    console.error("Get booking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve booking" },
      { status: 500 }
    );
  }
}
