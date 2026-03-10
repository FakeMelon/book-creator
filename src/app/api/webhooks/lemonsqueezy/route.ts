import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { createPrintOrder } from "@/lib/lulu";
import { sendOrderConfirmationEmail, type EmailLocale } from "@/lib/resend";
import { formatPrice } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.text();

  // Verify webhook signature
  const signature = req.headers.get("x-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const hmac = crypto.createHmac("sha256", process.env.LEMONSQUEEZY_WEBHOOK_SECRET!);
  hmac.update(body);
  const digest = hmac.digest("hex");

  if (digest !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);
  const eventName = event.meta.event_name;

  if (eventName === "order_created") {
    const orderId = event.meta.custom_data?.order_id;
    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { book: true, user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order to paid
    await db.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        lemonSqueezyOrderId: String(event.data.id),
        paidAt: new Date(),
      },
    });

    // Update book status
    await db.book.update({
      where: { id: order.bookId },
      data: { status: "ORDERED" },
    });

    // Submit to Lulu for printing
    try {
      if (order.book.pdfUrl) {
        const luluOrder = await createPrintOrder({
          externalId: order.orderNumber,
          title: order.book.title || "Custom Story Book",
          pdfUrl: order.book.pdfUrl,
          coverType: order.coverType,
          format: order.format,
          shippingAddress: {
            name: order.shippingName,
            street1: order.shippingAddress1,
            street2: order.shippingAddress2 || undefined,
            city: order.shippingCity,
            state_code: order.shippingState || undefined,
            country_code: order.shippingCountry,
            postcode: order.shippingPostalCode,
          },
          email: order.user.email,
        });

        await db.order.update({
          where: { id: orderId },
          data: {
            status: "SUBMITTED_TO_PRINT",
            luluOrderId: String(luluOrder.id),
            submittedToLuluAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error("Lulu submission failed:", error);
    }

    // Send confirmation email
    if (order.user.email) {
      await sendOrderConfirmationEmail({
        to: order.user.email,
        orderNumber: order.orderNumber,
        childName: order.book.childName,
        bookTitle: order.book.title || "Your Custom Book",
        total: formatPrice(order.total),
        locale: order.book.language as EmailLocale,
      }).catch(console.error);
    }
  }

  return NextResponse.json({ received: true });
}
