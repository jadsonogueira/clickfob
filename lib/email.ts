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
    const appUrl = process.env.NEXTAUTH_URL || "";
    const appName = "ClickFob";
    let senderEmail = "noreply@mail.abacusai.app";
    
    try {
      if (appUrl) {
        senderEmail = `noreply@${new URL(appUrl).hostname}`;
      }
    } catch {
      // Use default sender email
    }

    const response = await fetch("https://apps.abacus.ai/api/sendNotificationEmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deployment_token: process.env.ABACUSAI_API_KEY,
        subject,
        body: htmlBody,
        is_html: true,
        recipient_email: to,
        sender_email: senderEmail,
        sender_alias: appName,
      }),
    });

    const result = await response.json();
    return result?.success === true;
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: #dc2626; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🔔 New Booking Request</h1>
        </div>
        
        <div style="padding: 30px;">
          <div style="background: #fef2f2; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #dc2626;">
            <h2 style="margin: 0; color: #dc2626; font-size: 22px;">Order #${orderNumber}</h2>
          </div>
          
          <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Service Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; color: #6b7280;">Service:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${serviceName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Price:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">$${servicePrice.toFixed(2)}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Date:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${bookingDate}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Time:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${bookingTime}</td></tr>
          </table>
          
          <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Customer Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; color: #6b7280;">Name:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${customerName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Address:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${customerAddress}</td></tr>
            ${customerUnit ? `<tr><td style="padding: 8px 0; color: #6b7280;">Unit/Buzzer:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${customerUnit}</td></tr>` : ""}
            <tr><td style="padding: 8px 0; color: #6b7280;">Email:</td><td style="padding: 8px 0; color: #374151;"><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">WhatsApp:</td><td style="padding: 8px 0; color: #374151;"><a href="https://wa.me/${customerWhatsapp.replace(/[^0-9]/g, '')}">${customerWhatsapp}</a></td></tr>
          </table>
          
          ${additionalNotes ? `
            <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Additional Notes</h3>
            <p style="background: #f3f4f6; padding: 15px; border-radius: 8px; color: #374151;">${additionalNotes}</p>
          ` : ""}
          
          <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Uploaded Photos</h3>
          <div style="display: flex; gap: 10px; margin: 15px 0;">
            <a href="${photoFrontUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">View Front Photo</a>
            <a href="${photoBackUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">View Back Photo</a>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://wa.me/${customerWhatsapp.replace(/[^0-9]/g, '')}" style="display: inline-block; background: #22c55e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Contact Customer on WhatsApp</a>
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
            <h2 style="margin: 0; color: #92400e; font-size: 22px;">Order #${orderNumber}</h2>
          </div>
          
          <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Customer</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; color: #6b7280;">Name:</td><td style="padding: 8px 0; color: #374151; font-weight: 600;">${customerName}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Email:</td><td style="padding: 8px 0; color: #374151;"><a href="mailto:${customerEmail}">${customerEmail}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">WhatsApp:</td><td style="padding: 8px 0; color: #374151;"><a href="https://wa.me/${customerWhatsapp.replace(/[^0-9]/g, '')}">${customerWhatsapp}</a></td></tr>
          </table>
          
          <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Requested Changes</h3>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; color: #374151; white-space: pre-wrap;">${requestedChanges}</div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://wa.me/${customerWhatsapp.replace(/[^0-9]/g, '')}" style="display: inline-block; background: #22c55e; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Contact Customer on WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  `;
}
