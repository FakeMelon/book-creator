import { Resend } from "resend";
import { routing } from "@/i18n/routing";

export type EmailLocale = (typeof routing.locales)[number];

function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY);
}

const fromEmail = process.env.RESEND_FROM_EMAIL || "books@littletales.com";

function isRtl(locale: EmailLocale): boolean {
  return locale === "he";
}

function fontStack(locale: EmailLocale): string {
  if (locale === "he") {
    return "'Rubik', 'Heebo', 'Arial', sans-serif";
  }
  return "'Quicksand', sans-serif";
}

function wrapHtml(locale: EmailLocale, content: string): string {
  const rtl = isRtl(locale);
  const dir = rtl ? "rtl" : "ltr";
  const fonts = fontStack(locale);
  const textAlign = rtl ? "right" : "left";

  return `
    <div dir="${dir}" style="font-family: ${fonts}; max-width: 600px; margin: 0 auto; padding: 20px; text-align: ${textAlign};">
      ${content}
    </div>
  `;
}

const emailStrings = {
  en: {
    bookReady: {
      subject: (childName: string) => `${childName}'s book is ready!`,
      heading: "Your Book is Ready!",
      body: (bookTitle: string, childName: string) =>
        `<strong>"${bookTitle}"</strong> featuring ${childName} is complete!`,
      cta: "Preview Your Book",
      footer: "Review the pages, make any edits, and order your printed copy!",
    },
    orderConfirmation: {
      subject: (bookTitle: string, orderNumber: string) =>
        `Order confirmed: ${bookTitle} (#${orderNumber})`,
      heading: "Order Confirmed!",
      body: (bookTitle: string, childName: string) =>
        `Thank you for your order! "${bookTitle}" for ${childName} is being sent to print.`,
      orderLabel: "Order:",
      totalLabel: "Total:",
      deliveryLabel: "Estimated delivery:",
      deliveryValue: "7-10 business days",
      footer: "We'll send you tracking information once your book ships!",
    },
    shippingNotification: {
      subject: (childName: string) => `${childName}'s book has shipped!`,
      heading: "Your Book Has Shipped!",
      body: (bookTitle: string) => `"${bookTitle}" is on its way!`,
      carrierLabel: "Carrier:",
      trackingLabel: "Tracking:",
      cta: "Track Your Package",
    },
  },
  he: {
    bookReady: {
      subject: (childName: string) => `הספר של ${childName} מוכן!`,
      heading: "!הספר שלכם מוכן",
      body: (bookTitle: string, childName: string) =>
        `<strong>"${bookTitle}"</strong> בכיכובו/ה של ${childName} הושלם!`,
      cta: "צפו בספר",
      footer: "!עברו על העמודים, ערכו שינויים והזמינו עותק מודפס",
    },
    orderConfirmation: {
      subject: (bookTitle: string, orderNumber: string) =>
        `ההזמנה אושרה: ${bookTitle} (#${orderNumber})`,
      heading: "!ההזמנה אושרה",
      body: (bookTitle: string, childName: string) =>
        `תודה על ההזמנה! "${bookTitle}" עבור ${childName} נשלח להדפסה.`,
      orderLabel: ":הזמנה",
      totalLabel: ":סה\"כ",
      deliveryLabel: ":זמן משלוח משוער",
      deliveryValue: "7-10 ימי עסקים",
      footer: "!נשלח לכם פרטי מעקב ברגע שהספר יישלח",
    },
    shippingNotification: {
      subject: (childName: string) => `הספר של ${childName} נשלח!`,
      heading: "!הספר שלכם נשלח",
      body: (bookTitle: string) => `"${bookTitle}" בדרך אליכם!`,
      carrierLabel: ":חברת משלוח",
      trackingLabel: ":מספר מעקב",
      cta: "עקבו אחר המשלוח",
    },
  },
  fr: {
    bookReady: {
      subject: (childName: string) => `Le livre de ${childName} est prêt !`,
      heading: "Votre livre est prêt !",
      body: (bookTitle: string, childName: string) =>
        `<strong>« ${bookTitle} »</strong> mettant en vedette ${childName} est terminé !`,
      cta: "Voir votre livre",
      footer: "Parcourez les pages, apportez des modifications et commandez votre exemplaire imprimé !",
    },
    orderConfirmation: {
      subject: (bookTitle: string, orderNumber: string) =>
        `Commande confirmée : ${bookTitle} (#${orderNumber})`,
      heading: "Commande confirmée !",
      body: (bookTitle: string, childName: string) =>
        `Merci pour votre commande ! « ${bookTitle} » pour ${childName} est en cours d'impression.`,
      orderLabel: "Commande :",
      totalLabel: "Total :",
      deliveryLabel: "Livraison estimée :",
      deliveryValue: "7 à 10 jours ouvrables",
      footer: "Nous vous enverrons les informations de suivi dès que votre livre sera expédié !",
    },
    shippingNotification: {
      subject: (childName: string) => `Le livre de ${childName} a été expédié !`,
      heading: "Votre livre a été expédié !",
      body: (bookTitle: string) => `« ${bookTitle} » est en route !`,
      carrierLabel: "Transporteur :",
      trackingLabel: "Suivi :",
      cta: "Suivre votre colis",
    },
  },
} as const;

export async function sendBookReadyEmail(params: {
  to: string;
  childName: string;
  bookTitle: string;
  previewUrl: string;
  locale?: EmailLocale;
}): Promise<void> {
  const locale = params.locale ?? "en";
  const strings = emailStrings[locale].bookReady;

  const content = `
    <h1 style="color: #FF6B6B; text-align: center;">${strings.heading}</h1>
    <p style="font-size: 18px; text-align: center;">
      ${strings.body(params.bookTitle, params.childName)}
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.previewUrl}"
         style="background: #FF6B6B; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 18px; font-weight: bold;">
        ${strings.cta}
      </a>
    </div>
    <p style="color: #666; text-align: center;">
      ${strings.footer}
    </p>
  `;

  await getResend().emails.send({
    from: `Littletales <${fromEmail}>`,
    to: params.to,
    subject: strings.subject(params.childName),
    html: wrapHtml(locale, content),
  });
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderNumber: string;
  childName: string;
  bookTitle: string;
  total: string;
  locale?: EmailLocale;
}): Promise<void> {
  const locale = params.locale ?? "en";
  const strings = emailStrings[locale].orderConfirmation;

  const content = `
    <h1 style="color: #FF6B6B; text-align: center;">${strings.heading}</h1>
    <p style="font-size: 16px;">
      ${strings.body(params.bookTitle, params.childName)}
    </p>
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>${strings.orderLabel}</strong> #${params.orderNumber}</p>
      <p><strong>${strings.totalLabel}</strong> ${params.total}</p>
      <p><strong>${strings.deliveryLabel}</strong> ${strings.deliveryValue}</p>
    </div>
    <p style="color: #666;">
      ${strings.footer}
    </p>
  `;

  await getResend().emails.send({
    from: `Littletales <${fromEmail}>`,
    to: params.to,
    subject: strings.subject(params.bookTitle, params.orderNumber),
    html: wrapHtml(locale, content),
  });
}

export async function sendShippingNotificationEmail(params: {
  to: string;
  childName: string;
  bookTitle: string;
  trackingUrl: string;
  trackingNumber: string;
  carrier: string;
  locale?: EmailLocale;
}): Promise<void> {
  const locale = params.locale ?? "en";
  const strings = emailStrings[locale].shippingNotification;

  const content = `
    <h1 style="color: #FF6B6B; text-align: center;">${strings.heading}</h1>
    <p style="font-size: 16px; text-align: center;">
      ${strings.body(params.bookTitle)}
    </p>
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>${strings.carrierLabel}</strong> ${params.carrier}</p>
      <p><strong>${strings.trackingLabel}</strong> ${params.trackingNumber}</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.trackingUrl}"
         style="background: #FF6B6B; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 18px; font-weight: bold;">
        ${strings.cta}
      </a>
    </div>
  `;

  await getResend().emails.send({
    from: `Littletales <${fromEmail}>`,
    to: params.to,
    subject: strings.subject(params.childName),
    html: wrapHtml(locale, content),
  });
}
