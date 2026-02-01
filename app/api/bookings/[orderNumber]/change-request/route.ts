import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail, generateChangeRequestEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getAdminEmail() {
  return process.env.ADMIN_EMAIL || "clickfobtoronto@gmail.com";
}

export async function POST(
  request: Request,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const orderNumber = params?.orderNumber?.toUpperCase();
    const body = await request.json().catch(() => null);
    const requestedChanges = body?.requestedChanges;

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
      select: {
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        customerWhatsapp: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const adminEmail = getAdminEmail();

    // ✅ Envia email para o admin correto
    const ok = await sendEmail({
      to: adminEmail,
      subject: `Change Request - Order #${orderNumber}`,
      htmlBody: generateChangeRequestEmail({
        orderNumber,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerWhatsapp: booking.customerWhatsapp,
        requestedChanges,
      }),
    });

    // Se quiser exigir sucesso do email, mantenha assim:
    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Failed to send change request email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Change request submitted successfully",
    });
  } catch (error: any) {
    console.error("Change request error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "Failed to submit change request" },
      { status: 500 }
    );
  }
}
