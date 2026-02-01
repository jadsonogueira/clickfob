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
    const port = Number(process.env.SMTP_PORT || "465");
    const secure = String(process.env.SMTP_SECURE || "true") === "true";
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.MAIL_FROM || (user ? `ClickFob <${user}>` : "");

    if (!host || !user || !pass || !from) {
      console.error("Missing SMTP env vars", {
        host: !!host,
        user: !!user,
        pass: !!pass,
        from: !!from,
      });
      return false;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html: htmlBody,
    });

    // Ajuda muito no log do Render
    console.log("Email sent:", { to, subject, messageId: info.messageId });

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
          <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 12px;">You are receiving this message from clickfob.ca</p>
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
  adminManageUrl,
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
  adminManageUrl: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: #0f172a; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">New Booking Request</h1>
          <p style="color:#cbd5e1; margin: 6px 0 0 0; font-size: 13px;">Order #${orderNumber}</p>
        </div>

        <div style="padding: 24px;">
          <h3 style="color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Service</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
            <tr><td style="padding: 8px 0; color: #6b7280;">Service:</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${serviceName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Price:</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">$${servicePrice.toFixed(2)}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Date:</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${bookingDate}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Time:</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${bookingTime}</td></tr>
          </table>

          <h3 style="color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Customer</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
            <tr><td style="padding: 8px 0; color: #6b7280;">Name:</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${customerName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Address:</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${customerAddress}</td></tr>
            ${customerUnit ? `<tr><td style="padding: 8px 0; color: #6b7280;">Unit/Buzzer:</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${customerUnit}</td></tr>` : ""}
            <tr><td style="padding: 8px 0; color: #6b7280;">Email:</td><td style="padding: 8px 0; color: #111827;">${customerEmail}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">WhatsApp:</td><td style="padding: 8px 0; color: #111827;">${customerWhatsapp}</td></tr>
          </table>

          ${additionalNotes ? `
            <h3 style="color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Notes</h3>
            <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; color: #111827; margin-bottom: 18px;">${additionalNotes}</div>
          ` : ""}

          <h3 style="color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Photos</h3>
          <div style="display:flex; gap: 10px; margin: 12px 0 18px 0;">
            <a href="${photoFrontUrl}" style="display:inline-block; background:#3b82f6; color:#fff; padding:10px 14px; border-radius:8px; text-decoration:none; font-weight:600;">View Front</a>
            <a href="${photoBackUrl}" style="display:inline-block; background:#3b82f6; color:#fff; padding:10px 14px; border-radius:8px; text-decoration:none; font-weight:600;">View Back</a>
          </div>

          <div style="background:#ecfeff; border:1px solid #a5f3fc; padding: 14px; border-radius: 10px;">
            <div style="font-weight:700; color:#0f172a; margin-bottom: 6px;">Manage this booking</div>
            <a href="${adminManageUrl}" style="color:#0369a1; text-decoration:none; word-break:break-all;">${adminManageUrl}</a>
          </div>

          <div style="text-align:center; margin-top: 18px; color:#94a3b8; font-size: 12px;">
            You are receiving this message from clickfob.ca
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
          <h1 style="color: white; margin: 0; font-size: 24px;">Change Request</h1>
        </div>

        <div style="padding: 24px;">
          <h2 style="margin: 0 0 10px 0; color: #92400e; font-size: 20px;">Order #${orderNumber}</h2>

          <div style="color:#111827; margin-bottom: 12px;">
            <div><strong>Name:</strong> ${customerName}</div>
            <div><strong>Email:</strong> ${customerEmail}</div>
            <div><strong>WhatsApp:</strong> ${customerWhatsapp}</div>
          </div>

          <h3 style="color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Requested Changes</h3>
          <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; color: #111827; white-space: pre-wrap;">${requestedChanges}</div>

          <div style="text-align:center; margin-top: 18px; color:#94a3b8; font-size: 12px;">
            You are receiving this message from clickfob.ca
          </div>
        </div>
      </div>
    </div>
  `;
}
