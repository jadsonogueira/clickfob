import nodemailer from "nodemailer";

type SendEmailArgs = {
  to: string;
  subject: string;
  htmlBody: string;
};

function required(name: string, value?: string) {
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function getTransporter() {
  const host = required("SMTP_HOST", process.env.SMTP_HOST);
  const port = Number(process.env.SMTP_PORT || 587);
  const user = required("SMTP_USER", process.env.SMTP_USER);
  const pass = required("SMTP_PASS", process.env.SMTP_PASS);

  // timeouts bem agressivos pra não travar request
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 geralmente é secure
    auth: { user, pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });
}

export async function sendEmail({ to, subject, htmlBody }: SendEmailArgs): Promise<boolean> {
  try {
    const transporter = getTransporter();

    const from =
      process.env.EMAIL_FROM ||
      `ClickFob <${process.env.SMTP_USER || "no-reply@clickfob.onrender.com"}>`;

    await withTimeout(
      transporter.sendMail({
        from,
        to,
        subject,
        html: htmlBody,
      }),
      20_000,
      "sendMail"
    );

    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

/* =========================
   Templates (mantém os seus)
   ========================= */

export function generateCustomerConfirmationEmail(/* ... */): string {
  // ✅ mantenha exatamente como você já tem
  return "";
}

export function generateAdminNotificationEmail(/* ... */): string {
  // ✅ mantenha exatamente como você já tem
  return "";
}

export function generateChangeRequestEmail(/* ... */): string {
  // ✅ mantenha exatamente como você já tem
  return "";
}
