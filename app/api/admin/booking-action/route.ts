// app/api/admin/booking-action/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminActionToken } from "@/lib/admin-actions";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";
import { sendEmail, generateBookingStatusUpdateEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

function htmlPage(title: string, message: string, extraHtml = "") {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
  <style>
    body{font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:24px;color:#111827}
    .card{max-width:640px;margin:0 auto;background:#fff;border-radius:16px;padding:24px;box-shadow:0 6px 24px rgba(0,0,0,.08)}
    h1{margin:0 0 10px;font-size:20px}
    p{margin:0 0 14px;color:#374151;line-height:1.5}
    a.btn{display:inline-block;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700}
    .blue{background:#2563eb;color:#fff}
    .gray{background:#e5e7eb;color:#111827}
    .muted{font-size:12px;color:#6b7280;margin-top:18px}
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
    ${extraHtml}
    <p class="muted">ClickFob Admin Action</p>
  </div>
</body>
</html>`;
}

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const found = parts.find((p) => p.startsWith(`${name}=`));
  if (!found) return null;
  return found.slice(name.length + 1);
}

// ✅ aceita cookie simples (igual à env) OU token assinado (modelo novo)
function isAdminAuthorized(cookieHeader: string | null) {
  const token = getCookieValue(cookieHeader, ADMIN_COOKIE_NAME);
  const expected = String(process.env.ADMIN_DASHBOARD_KEY || "").trim();

  if (expected && token && token === expected) return true;
  if (verifyAdminSessionToken(token).ok) return true;

  return false;
}

function normalizeOrderNumber(input: string) {
  return String(input || "").trim().toUpperCase();
}

function normalizeAction(input: string) {
  const a = String(input || "").trim().toLowerCase();
  if (a === "confirm" || a === "cancel") return a;
  return "";
}

async function updateBookingAndNotify({
  order,
  action,
}: {
  order: string;
  action: "confirm" | "cancel";
}) {
  const booking = await prisma.booking.findUnique({
    where: { orderNumber: order },
  });

  if (!booking) {
    return {
      ok: false as const,
      status: 404,
      error: `Booking ${order} was not found.`,
    };
  }

  const newStatus = action === "confirm" ? "confirmed" : "cancelled";

  if (booking.status === newStatus) {
    return {
      ok: true as const,
      status: 200,
      already: true,
      newStatus,
      booking,
    };
  }

  const updated = await prisma.booking.update({
    where: { orderNumber: order },
    data: { status: newStatus },
  });

  const baseUrl = getAppBaseUrl();
  const manageUrl = `${baseUrl}/manage/${order}`;

  const formattedDate = new Date(updated.bookingDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeLabel = timeSlotLabels[updated.bookingTime] || updated.bookingTime;

  const emailSent = await sendEmail({
    to: updated.customerEmail,
    subject:
      newStatus === "confirmed"
        ? `ClickFob Booking Confirmed - Order #${order}`
        : `ClickFob Booking Cancelled - Order #${order}`,
    htmlBody: generateBookingStatusUpdateEmail({
      orderNumber: order,
      customerName: updated.customerName,
      status: newStatus === "confirmed" ? "confirmed" : "cancelled",
      serviceName: updated.serviceType,
      bookingDate: formattedDate,
      bookingTime: timeLabel,
      manageUrl,
    }),
  });

  return {
    ok: true as const,
    status: 200,
    already: false,
    newStatus,
    manageUrl,
    emailSent,
    booking: updated,
  };
}

/**
 * MODO 1: GET via botão/link no email do admin
 * /api/admin/booking-action?order=XXX&action=confirm|cancel&token=YYY
 * => retorna HTML
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const order = normalizeOrderNumber(searchParams.get("order") || "");
    const action = normalizeAction(searchParams.get("action") || "");
    const token = String(searchParams.get("token") || "");

    if (!order || (action !== "confirm" && action !== "cancel") || !token) {
      return new NextResponse(htmlPage("Invalid request", "Missing or invalid parameters."), {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    const verified = verifyAdminActionToken(token);
    if (!verified.ok) {
      return new NextResponse(htmlPage("Action denied", verified.error), {
        status: 403,
        headers: { "Content-Type": "text/html" },
      });
    }

    if (verified.orderNumber !== order || verified.action !== action) {
      return new NextResponse(htmlPage("Action denied", "Token does not match request."), {
        status: 403,
        headers: { "Content-Type": "text/html" },
      });
    }

    const result = await updateBookingAndNotify({ order, action });

    if (!result.ok) {
      return new NextResponse(htmlPage("Not found", result.error), {
        status: result.status,
        headers: { "Content-Type": "text/html" },
      });
    }

    const baseUrl = getAppBaseUrl();
    const manageUrl = `${baseUrl}/manage/${order}`;

    if (result.already) {
      return new NextResponse(
        htmlPage(
          "Already updated",
          `Booking ${order} is already ${result.newStatus}.`,
          `<a class="btn blue" href="${manageUrl}" target="_blank" rel="noopener noreferrer">Open booking</a>`
        ),
        { status: 200, headers: { "Content-Type": "text/html" } }
      );
    }

    return new NextResponse(
      htmlPage(
        "Success",
        `Booking ${order} was set to ${result.newStatus}.`,
        `<a class="btn blue" href="${manageUrl}" target="_blank" rel="noopener noreferrer">Open booking</a>
         <span style="display:inline-block;width:10px"></span>
         <a class="btn gray" href="${baseUrl}" target="_blank" rel="noopener noreferrer">Home</a>`
      ),
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch (err: any) {
    console.error("Admin action error (GET):", err);
    return new NextResponse(htmlPage("Server error", err?.message || "Failed to process action."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
}

/**
 * MODO 2: POST via área de admin (cookie)
 * /api/admin/booking-action?order=XXX&action=confirm|cancel
 * => retorna JSON
 */
export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");

    // ✅ aqui foi a correção: aceitar cookie simples OU token assinado
    if (!isAdminAuthorized(cookieHeader)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const order = normalizeOrderNumber(url.searchParams.get("order") || "");
    const action = normalizeAction(url.searchParams.get("action") || "");

    if (!order || (action !== "confirm" && action !== "cancel")) {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid parameters (order/action)" },
        { status: 400 }
      );
    }

    const result = await updateBookingAndNotify({ order, action });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      ok: true,
      order,
      status: result.newStatus,
      already: result.already,
      emailSent: result.already ? undefined : result.emailSent,
      manageUrl: `${getAppBaseUrl()}/manage/${order}`,
    });
  } catch (err: any) {
    console.error("Admin action error (POST):", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to process action." },
      { status: 500 }
    );
  }
}
