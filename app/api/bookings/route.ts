import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateUniqueOrderNumber } from "@/lib/order-utils";
import { getFileUrl } from "@/lib/s3";
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

function isAbsoluteHttpUrl(value?: string | null) {
  if (!value) return false;
  const v = String(value).trim();
  return v.startsWith("http://") || v.startsWith("https://");
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

    // Validate required fields
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

    // Check if slot is already booked
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

    // Generate unique order number
    const orderNumber = await generateUniqueOrderNumber();

    // Create booking (salva URL direto — Cloudinary)
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

        // ✅ Cloudinary URLs ficam aqui
        photoFrontUrl: photoFrontPath,
        photoBackUrl: photoBackPath,

        // Mantemos por compatibilidade com legado do S3 (não atrapalha)
        photoFrontPublic: true,
        photoBackPublic: true,

        status: "pending",
      },
    });

    // ✅ URLs para e-mail:
    // - Se já for URL absoluta (Cloudinary), usa direto
    // - Se for legado (path relativo), assina/monta via getFileUrl
    const emailFrontUrl = isAbsoluteHttpUrl(photoFrontPath)
      ? photoFrontPath
      : await getFileUrl(photoFrontPath, true);

    const emailBackUrl = isAbsoluteHttpUrl(photoBackPath)
      ? photoBackPath
      : await getFileUrl(photoBackPath, true);

    const formattedDate = new Date(bookingDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const timeLabel = timeSlotLabels[bookingTime] || bookingTime;

    // Base URL do site
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const manageUrl = `${baseUrl}/manage/${orderNumber}`;

    // Send customer confirmation email
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

    // Send admin notification email
    await sendEmail({
      to: "clickfob@gmail.com",
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
        photoFrontUrl: emailFrontUrl,
        photoBackUrl: emailBackUrl,
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
