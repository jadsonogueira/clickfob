import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/admin-auth";
import { sendEmail, generateBookingStatusUpdateEmail } from "@/lib/email";

export async function PATCH(
  req: Request,
  { params }: { params: { orderNumber: string } }
) {
  const token = req.headers
    .get("cookie")
    ?.split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(`${ADMIN_COOKIE_NAME}=`))
    ?.split("=")[1];

  if (!verifyAdminSessionToken(token).ok) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { status } = await req.json();
  if (!["confirmed", "cancelled"].includes(status)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const booking = await prisma.booking.update({
    where: { orderNumber: params.orderNumber },
    data: {
      status,
      statusUpdatedAt: new Date(),
      confirmedAt: status === "confirmed" ? new Date() : null,
      cancelledAt: status === "cancelled" ? new Date() : null,
    },
  });

  // email
  await sendEmail({
    to: booking.customerEmail,
    subject: `ClickFob Booking ${status}`,
    htmlBody: generateBookingStatusUpdateEmail({
      orderNumber: booking.orderNumber,
      customerName: booking.customerName,
      status,
      serviceName: booking.serviceType,
      bookingDate: booking.bookingDate.toDateString(),
      bookingTime: booking.bookingTime,
      manageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/manage/${booking.orderNumber}`,
    }),
  });

  return NextResponse.json({ ok: true });
}
