import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateUniqueOrderNumber } from "@/lib/order-utils";
import { createAdminActionToken } from "@/lib/admin-actions";
import {
  sendEmail,
  generateCustomerConfirmationEmail,
  generateAdminNotificationEmail,
} from "@/lib/email";

export const dynamic = "force-dynamic";

const services: Record<string, { name: string; price: number }> = {
  "fob-lf": { name: "Fob Low Frequency (LF)", price: 35 },
  "fob-hf": { name: "Fob High Frequency (HF)", price: 60 },
  "garage-remote": { name: "Garage Remote", price: 80 },
};

const timeSlotLabels: Record<string, string> = {
  "9-11": "9:00 AM - 11:00 AM",
  "11-13": "11:00 AM - 1:00 PM",
  "13-15": "1:00 PM - 3:00 PM",
  "15-17": "3:00 PM - 5:00 PM",
};

function getAppBaseUrl() {
  const a = process.env.NEXT_PUBLIC_APP_URL;
  const b = process.env.NEXTAUTH_URL;
  return (a || b || "http://localhost:3000").replace(/\/$/, "");
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      serviceId,
      bookingDate,
      bookingTime,
      customerName,
      customerAddress,
      customerUnit,
      customerEmail,
      customerWhatsapp,
      additionalNotes,
      photoFrontPath,
      photoBackPath,
    } = data ?? {};

    if (
      !serviceId ||
      !bookingDate ||
      !bookingTime ||
      !customerName ||
      !customerAddress ||
      !customerEmail ||
      !customerWhatsapp ||
      !photoFrontPath ||
      !photoBackPath
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const service = services[serviceId];
    if (!service) {
      return NextResponse.json(
        { success: false, error: "Invalid service" },
        { status: 400 }
      );
    }

    const existingBooking = await prisma.booking.findFirst({
      where: {
        bookingDate: new Date(bookingDate),
        bookingTime,
        status: { not: "cancelled" },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: "This time slot is no longer available" },
        { status: 400 }
      );
    }

    const orderNumber = await generateUniqueOrderNumber();

    const booking = await prisma.booking.create({
      data: {
        orderNumber,
        serviceType: service.name,
        servicePrice: service.price,
        bookingDate: new Date(bookingDate),
        bookingTime,
        customerName,
        customerAddress,
        customerUnit: customerUnit || null,
        customerEmail,
        customerWhatsapp,
        additionalNotes: additionalNotes || null,

        // Cloudinary URLs
        photoFrontUrl: photoFrontPath,
        photoBackUrl: photoBackPath,

        photoFrontPublic: true,
        photoBackPublic: true,

        status: "pending",
      },
    });

    const formattedDate = new Date(bookingDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const timeLabel = timeSlotLabels[bookingTime] || bookingTime;

    const baseUrl = getAppBaseUrl();
    const manageUrl = `${baseUrl}/manage/${orderNumber}`;

    // photos already cloudinary URLs
    const photoFrontUrl = photoFrontPath;
    const photoBackUrl = photoBackPath;

    // Customer email
    await sendEmail({
      to: customerEmail,
      subject: `ClickFob Booking Confirmation - Order #${orderNumber}`,
      htmlBody: generateCustomerConfirmationEmail({
        orderNumber,
        serviceName: service.name,
        servicePrice: service.price,
        bookingDate: formattedDate,
        bookingTime: timeLabel,
        customerName,
        customerAddress: customerUnit
          ? `${customerAddress}, ${customerUnit}`
          : customerAddress,
        manageUrl,
      }),
    });

    // Admin actions links
    const confirmToken = createAdminActionToken({ orderNumber, action: "confirm" });
    const cancelToken = createAdminActionToken({ orderNumber, action: "cancel" });

    const confirmUrl = `${baseUrl}/api/admin/booking-action?order=${encodeURIComponent(
      orderNumber
    )}&action=confirm&token=${encodeURIComponent(confirmToken)}`;

    const cancelUrl = `${baseUrl}/api/admin/booking-action?order=${encodeURIComponent(
      orderNumber
    )}&action=cancel&token=${encodeURIComponent(cancelToken)}`;

    const adminEmail = process.env.ADMIN_EMAIL || "clickfobtoronto@gmail.com";

    await sendEmail({
      to: adminEmail,
      subject: `New Booking Request - Order #${orderNumber}`,
      htmlBody: generateAdminNotificationEmail({
        orderNumber,
        serviceName: service.name,
        servicePrice: service.price,
        bookingDate: formattedDate,
        bookingTime: timeLabel,
        customerName,
        customerAddress,
        customerUnit: customerUnit || undefined,
        customerEmail,
        customerWhatsapp,
        additionalNotes: additionalNotes || undefined,
        photoFrontUrl,
        photoBackUrl,
        confirmUrl,
        cancelUrl,
        manageUrl,
      }),
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
