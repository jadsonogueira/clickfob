import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminActionToken } from "@/lib/admin-actions";
import { sendEmail, generateBookingStatusUpdateEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const order = (searchParams.get("order") || "").toUpperCase();
    const action = (searchParams.get("action") || "").toLowerCase();
    const token = searchParams.get("token") || "";

    if (!order || (action !== "confirm" && action !== "cancel") || !token) {
      return new NextResponse(
        htmlPage("Invalid request", "Missing or invalid parameters."),
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    const verified = verifyAdminActionToken(token);
    if (!verified.ok) {
      return new NextResponse(
        htmlPage("Action denied", verified.error),
        { status: 403, headers: { "Content-Type": "text/html" } }
      );
    }

    // token bate com order/action?
    if (verified.orderNumber !== order || verified.action !== action) {
      return new NextResponse(
        htmlPage("Action denied", "Token does not match request."),
        { status: 403, headers: { "Content-Type": "text/html" } }
      );
    }

    const booking = await prisma.booking.findUnique({ where: { orderNumber: order } });
    if (!booking) {
      return new NextResponse(
        htmlPage("Not found", `Booking ${order} was not found.`),
        { status: 404, headers: { "Content-Type": "text/html" } }
      );
    }

    const newStatus = action === "confirm" ? "confirmed" : "cancelled";

    // se já está no mesmo status, só retorna OK sem fazer nada
    if (booking.status === newStatus) {
      const baseUrl = getAppBaseUrl();
      const manageUrl = `${baseUrl}/manage/${order}`;
      return new NextResponse(
        htmlPage(
          "Already updated",
          `Booking ${order} is already ${newStatus}.`,
          `<a class="btn blue" href="${manageUrl}" target="_blank" rel="noopener noreferrer">Open booking</a>`
        ),
        { status: 200, headers: { "Content-Type": "text/html" } }
      );
    }

    // atualiza
    await prisma.booking.update({
      where: { orderNumber: order },
      data: { status: newStatus },
    });

    // avisa o cliente por email
    const baseUrl = getAppBaseUrl();
    const manageUrl = `${baseUrl}/manage/${order}`;

    await sendEmail({
      to: booking.customerEmail,
      subject:
        newStatus === "confirmed"
          ? `ClickFob Booking Confirmed - Order #${order}`
          : `ClickFob Booking Cancelled - Order #${order}`,
      htmlBody: generateBookingStatusUpdateEmail({
        orderNumber: order,
        customerName: booking.customerName,
        status: newStatus === "confirmed" ? "confirmed" : "cancelled",
        manageUrl,
      }),
    });

    return new NextResponse(
      htmlPage(
        "Success",
        `Booking ${order} was set to ${newStatus}.`,
        `<a class="btn blue" href="${manageUrl}" target="_blank" rel="noopener noreferrer">Open booking</a>
         <span style="display:inline-block;width:10px"></span>
         <a class="btn gray" href="${baseUrl}" target="_blank" rel="noopener noreferrer">Home</a>`
      ),
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch (err: any) {
    console.error("Admin action error:", err);
    return new NextResponse(
      htmlPage("Server error", err?.message || "Failed to process action."),
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}
