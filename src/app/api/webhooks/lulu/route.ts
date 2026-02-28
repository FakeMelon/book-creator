import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendShippingNotificationEmail } from "@/lib/resend";

export async function POST(req: Request) {
  const body = await req.json();

  // Lulu webhook events
  const { event_type } = body;

  if (event_type === "PRINT_JOB_STATUS_CHANGED") {
    const { id: luluOrderId, status, line_items } = body.data;

    const order = await db.order.findFirst({
      where: { luluOrderId: String(luluOrderId) },
      include: { book: true, user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const statusName = status?.name?.toUpperCase();

    if (statusName === "IN_PRODUCTION") {
      await db.order.update({
        where: { id: order.id },
        data: { status: "PRINTING" },
      });
    }

    if (statusName === "SHIPPED") {
      const trackingUrl = line_items?.[0]?.tracking_urls?.[0] || null;
      const trackingId = line_items?.[0]?.tracking_id || null;
      const carrier = line_items?.[0]?.shipping_carrier || null;

      await db.order.update({
        where: { id: order.id },
        data: {
          status: "SHIPPED",
          shippedAt: new Date(),
          luluTrackingUrl: trackingUrl,
          luluTrackingNumber: trackingId,
          luluShippingCarrier: carrier,
        },
      });

      // Send shipping notification
      if (order.user.email && trackingUrl) {
        await sendShippingNotificationEmail({
          to: order.user.email,
          childName: order.book.childName,
          bookTitle: order.book.title || "Your Custom Book",
          trackingUrl,
          trackingNumber: trackingId || "N/A",
          carrier: carrier || "Standard Shipping",
          // Only "he" has translated email templates; all others fall back to English
          locale: (order.book.language === "he" ? "he" : "en") as "en" | "he",
        }).catch(console.error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
