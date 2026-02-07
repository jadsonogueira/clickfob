// lib/email.ts
/* eslint-disable no-console */

function getEnv(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

/**
 * RESEND
 * Required env vars:
 * - RESEND_API_KEY
 * - RESEND_FROM  (ex: "ClickFob <clickfobtoronto@gmail.com>" ou domínio verificado no Resend)
 *
 * Optional:
 * - EMAIL_FROM (se quiser manter o mesmo nome, mas recomendo usar RESEND_FROM)
 */
async function sendViaResend({
  to,
  subject,
  htmlBody,
}: {
  to: string;
  subject: string;
  htmlBody: string;
}): Promise<boolean> {
  const apiKey = getEnv("RESEND_API_KEY");
  const from = getEnv("RESEND_FROM") || getEnv("EMAIL_FROM");

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY env var.");
  }
  if (!from) {
    throw new Error("Missing RESEND_FROM env var (or EMAIL_FROM).");
  }

  // Resend expects `to` as array
  const payload = {
    from,
    to: [to],
    subject,
    html: htmlBody,
  };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let details: any = null;
    try {
      details = await res.json();
    } catch {
      // ignore
    }
    console.error("Email send error (Resend):", {
      status: res.status,
      statusText: res.statusText,
      details,
    });
    return false;
  }

  return true;
}

export async function sendEmail({
  to,
  subject,
  htmlBody,
}: {
  to: string;
  subject: string;
  htmlBody: string;
}): Promise<boolean> {
  try {
    return await sendViaResend({ to, subject, htmlBody });
  } catch (error: any) {
    console.error("Email send error:", {
      message: error?.message || String(error),
    });
    return false;
  }
}

/* -----------------------------
   EMAIL TEMPLATES
------------------------------ */

export function generateCustomerConfirmationEmail({
  orderNumber,
  serviceName,
  servicePrice,
  bookingDate,
  bookingTime,
  customerName,
  customerAddress,
  manageUrl,
  items,
}: {
  orderNumber: string;
  serviceName: string;
  servicePrice: number;
  bookingDate: string;
  bookingTime: string;
  customerName: string;
  customerAddress: string;
  manageUrl: string;
  items?: Array<{
    serviceName?: string;
    label?: string;
    unitPrice?: number;
    quantity?: number;
  }>;
}): string {
  let origin = "";
  try {
    origin = new URL(manageUrl).origin;
  } catch {
    origin = "";
  }
  const termsUrl = origin ? `${origin}/terms?lang=en` : "";
  const privacyUrl = origin ? `${origin}/privacy?lang=en` : "";

  const hasItems = Array.isArray(items) && items.length > 0;
  const itemsHtml = hasItems
    ? `
      <div style="margin: 10px 0 0 0;">
        <p style="margin: 0 0 8px 0; color:#6b7280; font-size: 13px;"><strong>Items</strong></p>
        <table style="width:100%; border-collapse: collapse; font-size: 13px;">
          ${items
            .map((it) => {
              const name = escapeHtml(String(it?.label || it?.serviceName || "Item"));
              const qty = Math.max(1, Number(it?.quantity || 1));
              const unit = Number(it?.unitPrice || 0);
              return `<tr>
                <td style="padding: 6px 0; color:#374151;">${name} × ${qty}</td>
                <td style="padding: 6px 0; color:#374151; text-align:right; font-weight:600;">$${(unit * qty).toFixed(2)}</td>
              </tr>`;
            })
            .join("")}
        </table>
      </div>
    `
    : "";
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">ClickFob</h1>
          <p style="color: #bfdbfe; margin: 10px 0 0 0;">Booking Confirmation</p>
        </div>

        <div style="padding: 30px;">
          <p style="font-size: 18px; color: #374151;">Hi ${escapeHtml(
            customerName
          )},</p>
          <p style="color: #6b7280;">Thank you for your booking! Here are your details:</p>

          <div style="background: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h2 style="margin: 0 0 15px 0; color: #1e40af; font-size: 20px;">Order #${escapeHtml(
              orderNumber
            )}</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280;">Service:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${escapeHtml(
                serviceName
              )}</td></tr>
              <tr><td colspan="2">${itemsHtml}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Date:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${escapeHtml(
                bookingDate
              )}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Time:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${escapeHtml(
                bookingTime
              )}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Address:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${escapeHtml(
                customerAddress
              )}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 700;">Total:</td><td style="padding: 8px 0; color: #1e40af; font-weight: 700; font-size: 18px;">$${servicePrice.toFixed(
                2
              )}</td></tr>
            </table>
          </div>

          <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">⏳ Your booking is pending confirmation. We'll contact you shortly to confirm.</p>
          </div>

          <div style="background: #f3f4f6; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #374151; font-size: 13px; line-height: 1.5;">
              <strong>Authorization required:</strong> You confirmed that you are an authorized user of this key fob.
              Duplication is subject to technical compatibility.
            </p>
            ${
              termsUrl && privacyUrl
                ? `<p style="margin: 10px 0 0 0; color:#6b7280; font-size: 12px;">
                    <a href="${termsUrl}" style="color:#2563eb; text-decoration:none;">Terms & Conditions</a>
                    &nbsp;·&nbsp;
                    <a href="${privacyUrl}" style="color:#2563eb; text-decoration:none;">Privacy Policy</a>
                  </p>`
                : ""
            }
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${manageUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 5px;">Manage Booking</a>
            <a href="https://wa.me/14167707036" style="display: inline-block; background: #22c55e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 5px;">Contact Us on WhatsApp</a>
          </div>
        </div>

        <div style="background: #f3f4f6; padding: 20px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">ClickFob - On-site Fob Copying & Garage Remote Service</p>
          <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 12px;">Serving all GTA</p>
        </div>
      </div>
    </div>
  `;
}

export function generateAdminNotificationEmail({
  orderNumber,
  serviceName,
  servicePrice,
  bookingDate,
  bookingTime,
  customerName,
  customerAddress,
  customerUnit,
  customerEmail,
  customerWhatsapp,
  additionalNotes,
  photoFrontUrl,
  photoBackUrl,
  confirmUrl,
  cancelUrl,
  manageUrl,
  adminActionHtml,
  items,
}: {
  orderNumber: string;
  serviceName: string;
  servicePrice: number;
  bookingDate: string;
  bookingTime: string;
  customerName: string;
  customerAddress: string;
  customerUnit?: string;
  customerEmail: string;
  customerWhatsapp: string;
  additionalNotes?: string;
  photoFrontUrl: string;
  photoBackUrl: string;
  confirmUrl?: string;
  cancelUrl?: string;
  manageUrl?: string;
  adminActionHtml?: string;
  items?: Array<{
    serviceName?: string;
    label?: string;
    unitPrice?: number;
    quantity?: number;
    photoFrontUrl?: string;
    photoBackUrl?: string;
  }>;
}): string {
  let origin = "";
  try {
    if (manageUrl) origin = new URL(manageUrl).origin;
    else if (confirmUrl) origin = new URL(confirmUrl).origin;
    else if (cancelUrl) origin = new URL(cancelUrl).origin;
  } catch {
    origin = "";
  }
  const termsUrl = origin ? `${origin}/terms?lang=en` : "";
  const privacyUrl = origin ? `${origin}/privacy?lang=en` : "";
  const actionsHtml =
    adminActionHtml ||
    (confirmUrl && cancelUrl
      ? `
        <div style="margin-top: 18px; padding: 16px; border-radius: 10px; background: #f8fafc; border: 1px solid #e5e7eb;">
          <p style="margin:0 0 10px 0; color:#111827; font-weight:700;">Admin actions</p>
          <div style="display:flex; gap: 10px; flex-wrap: wrap;">
            <a href="${confirmUrl}" style="display:inline-block; background:#16a34a; color:white; padding: 12px 18px; border-radius: 10px; text-decoration:none; font-weight:800;">Confirm</a>
            <a href="${cancelUrl}" style="display:inline-block; background:#dc2626; color:white; padding: 12px 18px; border-radius: 10px; text-decoration:none; font-weight:800;">Cancel</a>
            ${
              manageUrl
                ? `<a href="${manageUrl}" style="display:inline-block; background:#2563eb; color:white; padding: 12px 18px; border-radius: 10px; text-decoration:none; font-weight:800;">Open booking</a>`
                : ""
            }
          </div>
          <p style="margin:10px 0 0 0; color:#6b7280; font-size:12px; line-height:1.4;">
            These links are single-use/expiring and require a valid admin token.
          </p>
        </div>
      `
      : "");

  const hasItems = Array.isArray(items) && items.length > 0;
  const itemsSectionHtml = hasItems
    ? `
        <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0 20px 0;">
          ${items
            .map((it, idx) => {
              const name = escapeHtml(String(it?.label || it?.serviceName || `Item ${idx + 1}`));
              const qty = Math.max(1, Number(it?.quantity || 1));
              const unit = Number(it?.unitPrice || 0);
              const f = it?.photoFrontUrl ? ` — <a href="${it.photoFrontUrl}" style="color:#2563eb; text-decoration:none;">Front</a>` : "";
              const b = it?.photoBackUrl ? ` <a href="${it.photoBackUrl}" style="color:#2563eb; text-decoration:none;">Back</a>` : "";
              return `<tr>
                <td style="padding: 6px 0; color: #374151;">${name} × ${qty}${f}${b}</td>
                <td style="padding: 6px 0; color: #374151; font-weight:600; text-align:right;">$${(unit * qty).toFixed(2)}</td>
              </tr>`;
            })
            .join("")}
        </table>
      `
    : "";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: #dc2626; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🔔 New Booking Request</h1>
        </div>

        <div style="padding: 30px;">
          <div style="background: #fef2f2; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #dc2626;">
            <h2 style="margin: 0; color: #dc2626; font-size: 22px;">Order #${escapeHtml(
              orderNumber
            )}</h2>
          </div>

          <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Service Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; color: #6b7280;">Service:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${escapeHtml(
              serviceName
            )}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Price:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">$${servicePrice.toFixed(
              2
            )}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Date:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${escapeHtml(
              bookingDate
            )}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Time:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${escapeHtml(
              bookingTime
            )}</td></tr>
          </table>

          ${itemsSectionHtml}

          <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Customer Information</h3>
          <div style="background:#f3f4f6; border-radius: 8px; padding: 12px; margin: 12px 0 18px 0;">
            <p style="margin: 0; color: #374151; font-size: 13px; line-height: 1.5;">
              <strong>Authorization confirmed:</strong> Customer confirmed they are an authorized user. Duplication is subject to compatibility.
            </p>
            ${
              termsUrl && privacyUrl
                ? `<p style="margin: 8px 0 0 0; color:#6b7280; font-size: 12px;">
                    <a href="${termsUrl}" style="color:#2563eb; text-decoration:none;">Terms & Conditions</a>
                    &nbsp;·&nbsp;
                    <a href="${privacyUrl}" style="color:#2563eb; text-decoration:none;">Privacy Policy</a>
                  </p>`
                : ""
            }
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; color: #6b7280;">Name:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${escapeHtml(
              customerName
            )}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Address:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${escapeHtml(
              customerAddress
            )}</td></tr>
            ${
              customerUnit
                ? `<tr><td style="padding: 8px 0; color: #6b7280;">Unit/Buzzer:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${escapeHtml(
                    customerUnit
                  )}</td></tr>`
                : ""
            }
            <tr><td style="padding: 8px 0; color: #6b7280;">Email:</td><td style="padding: 8px 0; color: #374151;"><a href="mailto:${escapeAttr(
              customerEmail
            )}">${escapeHtml(customerEmail)}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">WhatsApp:</td><td style="padding: 8px 0; color: #374151;"><a href="https://wa.me/${escapeAttr(
              customerWhatsapp.replace(/[^0-9]/g, "")
            )}">${escapeHtml(customerWhatsapp)}</a></td></tr>
          </table>

          ${
            additionalNotes
              ? `
            <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Additional Notes</h3>
            <p style="background: #f3f4f6; padding: 15px; border-radius: 8px; color: #374151;">${escapeHtml(
              additionalNotes
            )}</p>
          `
              : ""
          }

          <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Uploaded Photos</h3>
          <div style="display: flex; gap: 10px; margin: 15px 0; flex-wrap: wrap;">
            <a href="${photoFrontUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">View Front Photo</a>
            <a href="${photoBackUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">View Back Photo</a>
          </div>

          ${actionsHtml}

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://wa.me/${customerWhatsapp.replace(/[^0-9]/g, "")}" style="display: inline-block; background: #22c55e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Contact Customer on WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function generateChangeRequestEmail({
  orderNumber,
  customerName,
  customerEmail,
  customerWhatsapp,
  requestedChanges,
}: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;
  requestedChanges: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: #f59e0b; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📝 Change Request</h1>
        </div>

        <div style="padding: 30px;">
          <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
            <h2 style="margin: 0; color: #92400e; font-size: 22px;">Order #${escapeHtml(
              orderNumber
            )}</h2>
          </div>

          <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Customer</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; color: #6b7280;">Name:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${escapeHtml(
              customerName
            )}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Email:</td><td style="padding: 8px 0; color: #374151;"><a href="mailto:${escapeAttr(
              customerEmail
            )}">${escapeHtml(customerEmail)}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">WhatsApp:</td><td style="padding: 8px 0; color: #374151;"><a href="https://wa.me/${escapeAttr(
              customerWhatsapp.replace(/[^0-9]/g, "")
            )}">${escapeHtml(customerWhatsapp)}</a></td></tr>
          </table>

          <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Requested Changes</h3>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; color: #374151; white-space: pre-wrap;">${escapeHtml(
            requestedChanges
          )}</div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://wa.me/${customerWhatsapp.replace(/[^0-9]/g, "")}" style="display: inline-block; background: #22c55e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Contact Customer on WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Usada pelo: app/api/admin/booking-action/route.ts
 * (serviceName/bookingDate/bookingTime são opcionais para não quebrar build se algum caller não mandar)
 */
export function generateBookingStatusUpdateEmail({
  orderNumber,
  customerName,
  status,
  serviceName,
  bookingDate,
  bookingTime,
  manageUrl,
}: {
  orderNumber: string;
  customerName: string;
  status: "pending" | "confirmed" | "cancelled";
  serviceName?: string;
  bookingDate?: string;
  bookingTime?: string;
  manageUrl: string;
}): string {
  const statusLabel =
    status === "confirmed"
      ? "Confirmed ✅"
      : status === "cancelled"
      ? "Cancelled ❌"
      : "Pending ⏳";

  const statusColor =
    status === "confirmed"
      ? "#16a34a"
      : status === "cancelled"
      ? "#dc2626"
      : "#f59e0b";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #334155 100%); padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">ClickFob</h1>
          <p style="color: #cbd5e1; margin: 8px 0 0 0;">Booking Status Update</p>
        </div>

        <div style="padding: 28px;">
          <p style="font-size: 16px; color: #374151;">Hi ${escapeHtml(
            customerName
          )},</p>
          <p style="color: #6b7280; margin-top: 6px;">
            Your booking status has been updated.
          </p>

          <div style="background: #f8fafc; border-radius: 10px; padding: 18px; margin: 18px 0; border-left: 4px solid ${statusColor};">
            <div style="display:flex; align-items:center; justify-content:space-between; gap: 10px;">
              <div>
                <div style="color:#0f172a; font-weight:700; font-size:18px;">Order #${escapeHtml(
                  orderNumber
                )}</div>
                <div style="color:#475569; margin-top: 6px;">
                  ${
                    serviceName
                      ? `<div><strong>Service:</strong> ${escapeHtml(
                          serviceName
                        )}</div>`
                      : ""
                  }
                  ${
                    bookingDate
                      ? `<div><strong>Date:</strong> ${escapeHtml(
                          bookingDate
                        )}</div>`
                      : ""
                  }
                  ${
                    bookingTime
                      ? `<div><strong>Time:</strong> ${escapeHtml(
                          bookingTime
                        )}</div>`
                      : ""
                  }
                </div>
              </div>
              <div style="padding:10px 12px; border-radius:999px; background:${statusColor}; color:white; font-weight:700; white-space:nowrap;">
                ${statusLabel}
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 22px 0 6px;">
            <a href="${manageUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 22px; border-radius: 10px; text-decoration: none; font-weight: 700;">
              View Booking
            </a>
          </div>

          <div style="text-align:center; margin-top: 10px;">
            <a href="https://wa.me/14167707036" style="color:#16a34a; text-decoration:none; font-weight:700;">
              Contact us on WhatsApp
            </a>
          </div>
        </div>

        <div style="background: #f3f4f6; padding: 16px; text-align: center;">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">You are receiving this message from clickfob.onrender.com</p>
        </div>
      </div>
    </div>
  `;
}

/* -----------------------------
   small safety helpers
------------------------------ */

function escapeHtml(input: string) {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(input: string) {
  return escapeHtml(input).replace(/`/g, "&#096;");
}
