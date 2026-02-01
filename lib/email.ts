import nodemailer from "nodemailer";

/* --------------------------------------------------
 * Transporter
 * -------------------------------------------------- */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration is incomplete");
  }

  const secure =
    process.env.SMTP_SECURE === "true" || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

/* --------------------------------------------------
 * Send Email
 * -------------------------------------------------- */
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
    const transporter = createTransporter();

    const from =
      process.env.EMAIL_FROM ||
      `ClickFob <${process.env.SMTP_USER}>`;

    await transporter.sendMail({
      from,
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

/* --------------------------------------------------
 * Customer Confirmation Email
 * -------------------------------------------------- */
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
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto;">
      <h2>ClickFob – Booking Confirmation</h2>
      <p>Hi ${customerName},</p>

      <p>Your booking was received and is pending confirmation.</p>

      <p><strong>Order:</strong> ${orderNumber}</p>
      <p><strong>Service:</strong> ${serviceName}</p>
      <p><strong>Date:</strong> ${bookingDate}</p>
      <p><strong>Time:</strong> ${bookingTime}</p>
      <p><strong>Address:</strong> ${customerAddress}</p>
      <p><strong>Total:</strong> $${servicePrice.toFixed(2)}</p>

      <p style="margin-top:20px;">
        <a href="${manageUrl}" 
           style="background:#2563eb;color:#fff;padding:12px 20px;
                  text-decoration:none;border-radius:6px;">
          Manage Booking
        </a>
      </p>

      <p>If you need help, contact us on WhatsApp.</p>
      <p>ClickFob – GTA</p>
    </div>
  `;
}

/* --------------------------------------------------
 * Admin Notification Email
 * -------------------------------------------------- */
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
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto;">
      <h2>🚨 New Booking Request</h2>

      <p><strong>Order:</strong> ${orderNumber}</p>
      <p><strong>Service:</strong> ${serviceName}</p>
      <p><strong>Price:</strong> $${servicePrice.toFixed(2)}</p>
      <p><strong>Date:</strong> ${bookingDate}</p>
      <p><strong>Time:</strong> ${bookingTime}</p>

      <hr />

      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Address:</strong> ${customerAddress}</p>
      ${customerUnit ? `<p><strong>Unit:</strong> ${customerUnit}</p>` : ""}
      <p><strong>Email:</strong> ${customerEmail}</p>
      <p><strong>WhatsApp:</strong> ${customerWhatsapp}</p>

      ${
        additionalNotes
          ? `<p><strong>Notes:</strong><br/>${additionalNotes}</p>`
          : ""
      }

      <p>
        <a href="${photoFrontUrl}">View Front Photo</a><br/>
        <a href="${photoBackUrl}">View Back Photo</a>
      </p>
    </div>
  `;
}

/* --------------------------------------------------
 * Change Request Email
 * -------------------------------------------------- */
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
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto;">
      <h2>📝 Change Request</h2>

      <p><strong>Order:</strong> ${orderNumber}</p>
      <p><strong>Name:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${customerEmail}</p>
      <p><strong>WhatsApp:</strong> ${customerWhatsapp}</p>

      <hr />

      <p><strong>Requested changes:</strong></p>
      <pre style="background:#f3f4f6;padding:12px;border-radius:6px;">
${requestedChanges}
      </pre>
    </div>
  `;
}
