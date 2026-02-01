import nodemailer from "nodemailer";

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
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      throw new Error("Missing SMTP env vars (SMTP_HOST/SMTP_USER/SMTP_PASS)");
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const fromName = "ClickFob";
    const fromEmail = process.env.FROM_EMAIL || user;

    await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html: htmlBody,
    });

    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

export function generateCustomerConfirmationEmail({
  orderNumber,
  serviceName,
  servicePrice,
  bookingDate,
  bookingTime,
  customerName,
  customerAddress,
  manageUrl,
}: {
  orderNumber: string;
  serviceName: string;
  servicePrice: number;
  bookingDate: string;
  bookingTime: string;
  customerName: string;
  customerAddress: string;
  manageUrl: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">ClickFob</h1>
          <p style="color: #bfdbfe; margin: 10px 0 0 0;">Booking Confirmation</p>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 18px; color: #374151;">Hi ${customerName},</p>
          <p style="color: #6b7280;">Thank you for your booking! Here are your details:</p>
          
          <div style="background: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h2 style="margin: 0 0 15px 0; color: #1e40af; font-size: 20px;">Order #${orderNumber}</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #6b7280;">Service:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${serviceName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Date:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${bookingDate}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Time:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${bookingTime}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Address:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${customerAddress}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 700;">Total:</td><td style="padding: 8px 0; color: #1e40af; font-weight: 700; font-size: 18px;">$${servicePrice.toFixed(2)}</td></tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">⏳ Your booking is pending confirmation. We'll contact you shortly to confirm.</p>
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
  confirmUrl: string;
  cancelUrl: string;
  manageUrl: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #f9fafb; padding: 20px;">
      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: #111827; padding: 18px 20px;">
          <h1 style="color: white; margin: 0; font-size: 20px;">New Booking Request</h1>
          <p style="color: #9ca3af; margin: 6px 0 0 0; font-size: 13px;">Order #${orderNumber}</p>
        </div>

        <div style="padding: 20px;">
          <div style="background: #f3f4f6; border-radius: 10px; padding: 14px; margin-bottom: 14px;">
            <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
              <div>
                <div style="font-size:12px;color:#6b7280;">Service</div>
                <div style="font-size:16px;font-weight:700;color:#111827;">${serviceName}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:12px;color:#6b7280;">Total</div>
                <div style="font-size:18px;font-weight:800;color:#2563eb;">$${servicePrice.toFixed(2)}</div>
              </div>
            </div>
            <div style="margin-top:10px;font-size:13px;color:#374151;">
              <div><b>Date:</b> ${bookingDate}</div>
              <div><b>Time:</b> ${bookingTime}</div>
            </div>
          </div>

          <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; margin-bottom: 14px;">
            <div style="font-weight:800;color:#111827;margin-bottom:8px;">Customer</div>
            <div style="font-size:13px;color:#374151;line-height:1.6;">
              <div><b>Name:</b> ${customerName}</div>
              <div><b>Address:</b> ${customerAddress}${customerUnit ? `, ${customerUnit}` : ""}</div>
              <div><b>Email:</b> <a href="mailto:${customerEmail}">${customerEmail}</a></div>
              <div><b>WhatsApp:</b> <a href="https://wa.me/${customerWhatsapp.replace(/[^0-9]/g, "")}">${customerWhatsapp}</a></div>
            </div>
          </div>

          ${
            additionalNotes
              ? `
            <div style="background:#f3f4f6;border-radius:10px;padding:14px;margin-bottom:14px;">
              <div style="font-weight:800;color:#111827;margin-bottom:8px;">Additional Notes</div>
              <div style="font-size:13px;color:#374151;white-space:pre-wrap;">${additionalNotes}</div>
            </div>
          `
              : ""
          }

          <div style="background:#f3f4f6;border-radius:10px;padding:14px;margin-bottom:14px;">
            <div style="font-weight:800;color:#111827;margin-bottom:10px;">Uploaded Photos</div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <a href="${photoFrontUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none;font-weight:800;">View Front</a>
              <a href="${photoBackUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none;font-weight:800;">View Back</a>
              <a href="${manageUrl}" style="display:inline-block;background:#111827;color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none;font-weight:800;">Open Booking</a>
            </div>
          </div>

          <div style="background:#ecfeff;border:1px solid #a5f3fc;border-radius:10px;padding:14px;">
            <div style="font-weight:900;color:#0f172a;margin-bottom:10px;">Admin Actions</div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <a href="${confirmUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:900;">✅ Confirm</a>
              <a href="${cancelUrl}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:900;">⛔ Cancel</a>
            </div>
            <div style="margin-top:10px;font-size:12px;color:#475569;">
              These links are protected and expire automatically.
            </div>
          </div>
        </div>

        <div style="background:#f3f4f6;padding:14px 20px;text-align:center;">
          <div style="font-size:12px;color:#6b7280;">ClickFob Admin Notification</div>
        </div>
      </div>
    </div>
  `;
}

export function generateBookingStatusUpdateEmail({
  orderNumber,
  customerName,
  status,
  manageUrl,
}: {
  orderNumber: string;
  customerName: string;
  status: "confirmed" | "cancelled";
  manageUrl: string;
}): string {
  const isConfirmed = status === "confirmed";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: ${isConfirmed ? "#16a34a" : "#dc2626"}; padding: 22px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">
            ${isConfirmed ? "✅ Booking Confirmed" : "⛔ Booking Cancelled"}
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Order #${orderNumber}</p>
        </div>

        <div style="padding: 22px;">
          <p style="font-size: 16px; color: #111827; margin: 0 0 10px;">Hi ${customerName},</p>
          <p style="color: #374151; margin: 0 0 18px;">
            Your booking has been <b>${isConfirmed ? "confirmed" : "cancelled"}</b>.
          </p>

          <div style="text-align:center; margin-top: 18px;">
            <a href="${manageUrl}" style="display:inline-block;background:#2563eb;color:white;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:800;">
              View Booking
            </a>
          </div>

          <div style="text-align:center; margin-top: 14px;">
            <a href="https://wa.me/14167707036" style="display:inline-block;background:#22c55e;color:white;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:800;">
              Contact us on WhatsApp
            </a>
          </div>
        </div>

        <div style="background:#f3f4f6;padding:14px;text-align:center;">
          <div style="font-size:12px;color:#6b7280;">ClickFob - Serving all GTA</div>
        </div>
      </div>
    </div>
  `;
}
