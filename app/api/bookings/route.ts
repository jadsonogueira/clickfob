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
      items,
      totalPrice,
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

    const hasItemsArray = Array.isArray(items) && items.length > 0;

    // Multi-item path
    if (hasItemsArray) {
      if (!bookingDate || !bookingTime || !customerName || !customerAddress || !customerEmail || !customerWhatsapp) {
        return NextResponse.json(
          { success: false, error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Validate items
      type NormalizedItem = {
        serviceId: string;
        serviceName: string;
        unitPrice: number;
        quantity: number;
        label?: string;
        photoFrontUrl: string;
        photoBackUrl: string;
      };

      const normalizedItemsRaw: Array<NormalizedItem | null> = (items as any[]).map((it) => {
        const svc = services[String(it?.serviceId || "")];
        if (!svc) return null;
        const quantity = Math.max(1, Number(it?.quantity || 1));
        const label = typeof it?.label === "string" ? it.label.trim() : "";
        const photoFrontUrl = String(it?.photoFrontUrl || it?.photoFrontPath || "");
        const photoBackUrl = String(it?.photoBackUrl || it?.photoBackPath || "");
        if (!photoFrontUrl || !photoBackUrl) return null;
        return {
          serviceId: String(it.serviceId),
          serviceName: String(it?.serviceName || svc.name),
          unitPrice: Number(it?.unitPrice || svc.price),
          quantity,
          label: label || undefined,
          photoFrontUrl,
          photoBackUrl,
        };
      });

      // Filter nulls with a type guard so TS knows every item is valid
      const normalizedItems = normalizedItemsRaw.filter(
        (x): x is NormalizedItem => x !== null
      );

      if (!normalizedItems.length || normalizedItems.length !== normalizedItemsRaw.length) {
        return NextResponse.json(
          { success: false, error: "Invalid items" },
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

      const computedTotal = normalizedItems.reduce(
        (sum, it) => sum + Number(it.unitPrice) * Number(it.quantity),
        0
      );
      const total = typeof totalPrice === "number" ? totalPrice : computedTotal;

      const orderNumber = await generateUniqueOrderNumber();

      // Legacy fields for older UI/admin components
      const legacyServiceType =
        normalizedItems.length === 1
          ? normalizedItems[0]!.serviceName
          : "Multiple Items";

      const legacyFront = normalizedItems[0]!.photoFrontUrl;
      const legacyBack = normalizedItems[0]!.photoBackUrl;

      const booking = await prisma.booking.create({
        data: {
          orderNumber,
          serviceType: legacyServiceType,
          servicePrice: total,
          bookingDate: new Date(bookingDate),
          bookingTime,
          customerName,
          customerAddress,
          customerUnit: customerUnit || null,
          customerEmail,
          customerWhatsapp,
          additionalNotes: additionalNotes || null,

          photoFrontUrl: legacyFront,
          photoBackUrl: legacyBack,
          photoFrontPublic: true,
          photoBackPublic: true,

          items: normalizedItems as any,
          totalPrice: total,

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

      const customerEmailPromise = sendEmail({
        to: customerEmail,
        subject: `ClickFob Booking Confirmation - Order #${orderNumber}`,
        htmlBody: generateCustomerConfirmationEmail({
          orderNumber,
          serviceName: legacyServiceType,
          servicePrice: total,
          bookingDate: formattedDate,
          bookingTime: timeLabel,
          customerName,
          customerAddress: customerUnit ? `${customerAddress}, ${customerUnit}` : customerAddress,
          manageUrl,
          items: normalizedItems as any,
        } as any),
      });

      const adminEmailPromise = sendEmail({
        to: adminEmail,
        subject: `New Booking Request - Order #${orderNumber}`,
        htmlBody: generateAdminNotificationEmail({
          orderNumber,
          serviceName: legacyServiceType,
          servicePrice: total,
          bookingDate: formattedDate,
          bookingTime: timeLabel,
          customerName,
          customerAddress,
          customerUnit: customerUnit || undefined,
          customerEmail,
          customerWhatsapp,
          additionalNotes: additionalNotes || undefined,
          photoFrontUrl: legacyFront,
          photoBackUrl: legacyBack,
          confirmUrl,
          cancelUrl,
          manageUrl,
          items: normalizedItems as any,
        } as any),
      });

      void Promise.allSettled([customerEmailPromise, adminEmailPromise]).then(
        (results) => {
          const [r1, r2] = results;
          if (r1.status === "rejected") {
            console.error(`Email to customer failed (order ${orderNumber}):`, r1.reason);
          }
          if (r2.status === "rejected") {
            console.error(`Email to admin failed (order ${orderNumber}):`, r2.reason);
          }
        }
      );

      return NextResponse.json({
        success: true,
        orderNumber,
        bookingId: booking.id,
      });
    }

    // Legacy single-item path
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

    // Admin actions links
    const confirmToken = createAdminActionToken({
      orderNumber,
      action: "confirm",
    });
    const cancelToken = createAdminActionToken({
      orderNumber,
      action: "cancel",
    });

    const confirmUrl = `${baseUrl}/api/admin/booking-action?order=${encodeURIComponent(
      orderNumber
    )}&action=confirm&token=${encodeURIComponent(confirmToken)}`;

    const cancelUrl = `${baseUrl}/api/admin/booking-action?order=${encodeURIComponent(
      orderNumber
    )}&action=cancel&token=${encodeURIComponent(cancelToken)}`;

    const adminEmail = process.env.ADMIN_EMAIL || "clickfobtoronto@gmail.com";

    // ✅ NÃO TRAVAR A RESPOSTA: dispara emails sem await
    const customerEmailPromise = sendEmail({
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

    const adminEmailPromise = sendEmail({
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

    // Loga falhas sem afetar o usuário
    void Promise.allSettled([customerEmailPromise, adminEmailPromise]).then(
      (results) => {
        const [r1, r2] = results;
        if (r1.status === "rejected") {
          console.error(
            `Email to customer failed (order ${orderNumber}):`,
            r1.reason
          );
        }
        if (r2.status === "rejected") {
          console.error(
            `Email to admin failed (order ${orderNumber}):`,
            r2.reason
          );
        }
      }
    );

    // ✅ responde rápido
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
