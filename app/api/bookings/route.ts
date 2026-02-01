import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateUniqueOrderNumber } from "@/lib/order-utils";
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
  // ✅ Render: NEXT_PUBLIC_APP_URL=https://clickfob.onrender.com
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

    // Create booking
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

        // ✅ Cloudinary URLs
        photoFrontUrl: photoFrontPath,
        photoBackUrl: photoBackPath,

        // mantém se existir no schema
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

    // ✅ fotos já são URL (Cloudinary)
    const photoFrontUrl = photoFrontPath;
    const photoBackUrl = photoBackPath;

    // --- Send customer email
    const customerEmailOk = await sendEmail({
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

    if (!customerEmailOk) {
      console.error("Failed to send CUSTOMER email", {
        orderNumber,
        to: customerEmail,
      });
      // não vou falhar o booking por isso, mas loga forte
    }

    // --- Send admin email
    const adminEmail = process.env.ADMIN_EMAIL || "clickfobtoronto@gmail.com";

    const adminEmailOk = await sendEmail({
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

        // ✅ só use se você adicionou esse campo na função do email
        // adminManageUrl: `${baseUrl}/admin/bookings?key=${process.env.ADMIN_DASHBOARD_KEY || ""}`,
      } as any),
    });

    if (!adminEmailOk) {
      console.error("Failed to send ADMIN email", {
        orderNumber,
        to: adminEmail,
      });

      // ✅ aqui eu recomendo retornar erro, porque admin precisa receber.
      // (o booking já foi criado; mas você fica sabendo que falhou)
      return NextResponse.json(
        {
          success: false,
          error:
            "Booking created, but failed to notify admin. Please contact support.",
          orderNumber,
          bookingId: booking.id,
        },
        { status: 500 }
      );
    }

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
