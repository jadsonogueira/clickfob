import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getFileUrl } from "@/lib/s3";

export const dynamic = "force-dynamic";

function isAbsoluteHttpUrl(value?: string | null) {
  if (!value) return false;
  const v = String(value).trim();
  return v.startsWith("http://") || v.startsWith("https://");
}

function normalizeMaybeAbsoluteUrl(value?: string | null) {
  if (!value) return "";
  const v = String(value).trim();

  // Se veio "/https://..." (bem comum quando alguém salva com "/" na frente)
  if (v.startsWith("/http://") || v.startsWith("/https://")) return v.slice(1);

  return v;
}

async function resolvePhotoUrl(raw: string | null, isPublic?: boolean | null) {
  const normalized = normalizeMaybeAbsoluteUrl(raw);

  // ✅ Cloudinary (ou qualquer URL absoluta) => retorna direto, não passa no getFileUrl
  if (isAbsoluteHttpUrl(normalized)) return normalized;

  // ✅ Caso legado: path relativo => usa sua função atual (S3/abaccus)
  if (!normalized) return "";
  return await getFileUrl(normalized, !!isPublic);
}

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

    // ✅ Resolve URLs corretamente (Cloudinary direto, S3 só quando for path relativo)
    const photoFrontUrl = await resolvePhotoUrl(
      booking.photoFrontUrl,
      booking.photoFrontPublic
    );
    const photoBackUrl = await resolvePhotoUrl(
      booking.photoBackUrl,
      booking.photoBackPublic
    );

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
        photoFrontUrl,
        photoBackUrl,
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
