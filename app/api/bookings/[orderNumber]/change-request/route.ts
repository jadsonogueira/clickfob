import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail, generateChangeRequestEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const orderNumber = params?.orderNumber?.toUpperCase();
    const { requestedChanges } = await request.json();

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: "Order number is required" },
        { status: 400 }
      );
    }

    if (!requestedChanges?.trim()) {
      return NextResponse.json(
        { success: false, error: "Please describe the changes you need" },
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

    // Send change request email to admin
    await sendEmail({
      to: "clickfob@gmail.com",
      subject: `Change Request - Order #${orderNumber}`,
      htmlBody: generateChangeRequestEmail({
        orderNumber,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerWhatsapp: booking.customerWhatsapp,
        requestedChanges,
      }),
    });

    return NextResponse.json({
      success: true,
      message: "Change request submitted successfully",
    });
  } catch (error) {
    console.error("Change request error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit change request" },
      { status: 500 }
    );
  }
}
