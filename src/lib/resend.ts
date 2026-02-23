import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}
const fromEmail = process.env.RESEND_FROM_EMAIL || "books@storymagic.com";

export async function sendBookReadyEmail(params: {
  to: string;
  childName: string;
  bookTitle: string;
  previewUrl: string;
}) {
  await getResend().emails.send({
    from: `Storymagic <${fromEmail}>`,
    to: params.to,
    subject: `${params.childName}'s book is ready! 📖`,
    html: `
      <div style="font-family: 'Quicksand', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #6366f1; text-align: center;">Your Book is Ready!</h1>
        <p style="font-size: 18px; text-align: center;">
          <strong>"${params.bookTitle}"</strong> featuring ${params.childName} is complete!
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${params.previewUrl}"
             style="background: #6366f1; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 18px; font-weight: bold;">
            Preview Your Book
          </a>
        </div>
        <p style="color: #666; text-align: center;">
          Review the pages, make any edits, and order your printed copy!
        </p>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderNumber: string;
  childName: string;
  bookTitle: string;
  total: string;
}) {
  await getResend().emails.send({
    from: `Storymagic <${fromEmail}>`,
    to: params.to,
    subject: `Order confirmed: ${params.bookTitle} (#${params.orderNumber})`,
    html: `
      <div style="font-family: 'Quicksand', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #6366f1; text-align: center;">Order Confirmed!</h1>
        <p style="font-size: 16px;">
          Thank you for your order! "${params.bookTitle}" for ${params.childName} is being sent to print.
        </p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order:</strong> #${params.orderNumber}</p>
          <p><strong>Total:</strong> ${params.total}</p>
          <p><strong>Estimated delivery:</strong> 7-10 business days</p>
        </div>
        <p style="color: #666;">
          We'll send you tracking information once your book ships!
        </p>
      </div>
    `,
  });
}

export async function sendShippingNotificationEmail(params: {
  to: string;
  childName: string;
  bookTitle: string;
  trackingUrl: string;
  trackingNumber: string;
  carrier: string;
}) {
  await getResend().emails.send({
    from: `Storymagic <${fromEmail}>`,
    to: params.to,
    subject: `${params.childName}'s book has shipped! 📦`,
    html: `
      <div style="font-family: 'Quicksand', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #6366f1; text-align: center;">Your Book Has Shipped!</h1>
        <p style="font-size: 16px; text-align: center;">
          "${params.bookTitle}" is on its way!
        </p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Carrier:</strong> ${params.carrier}</p>
          <p><strong>Tracking:</strong> ${params.trackingNumber}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${params.trackingUrl}"
             style="background: #6366f1; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 18px; font-weight: bold;">
            Track Your Package
          </a>
        </div>
      </div>
    `,
  });
}
