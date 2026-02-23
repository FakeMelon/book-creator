import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkoutSchema } from "@/validators";
import { generateOrderNumber } from "@/lib/utils";
import { PRICING } from "@/constants";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = checkoutSchema.parse(body);

    const book = await db.book.findUnique({
      where: { id: data.bookId, userId: session.user.id },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (book.status !== "PREVIEW_READY" && book.status !== "APPROVED") {
      return NextResponse.json({ error: "Book is not ready for ordering" }, { status: 400 });
    }

    // Calculate pricing
    const subtotal = data.coverType === "HARDCOVER" ? PRICING.HARDCOVER_8X8 : PRICING.SOFTCOVER_8X8;

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        bookId: data.bookId,
        status: "PENDING_PAYMENT",
        subtotal,
        total: subtotal,
        format: book.format,
        coverType: data.coverType,
        shippingName: data.shippingName,
        shippingAddress1: data.shippingAddress1,
        shippingAddress2: data.shippingAddress2,
        shippingCity: data.shippingCity,
        shippingState: data.shippingState,
        shippingPostalCode: data.shippingPostalCode,
        shippingCountry: data.shippingCountry,
      },
    });

    // Create LemonSqueezy checkout
    const variantId =
      data.coverType === "HARDCOVER"
        ? process.env.LEMONSQUEEZY_HARDCOVER_VARIANT_ID
        : process.env.LEMONSQUEEZY_SOFTCOVER_VARIANT_ID;

    const lsResponse = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              custom: {
                order_id: order.id,
              },
            },
            product_options: {
              redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?order=${order.orderNumber}`,
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: process.env.LEMONSQUEEZY_STORE_ID,
              },
            },
            variant: {
              data: {
                type: "variants",
                id: variantId,
              },
            },
          },
        },
      }),
    });

    if (!lsResponse.ok) {
      const error = await lsResponse.text();
      console.error("LemonSqueezy checkout error:", error);
      return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
    }

    const lsData = await lsResponse.json();
    const checkoutUrl = lsData.data.attributes.url;

    // Update order with checkout URL
    await db.order.update({
      where: { id: order.id },
      data: { lemonSqueezyCheckoutUrl: checkoutUrl },
    });

    return NextResponse.json({ checkoutUrl, orderId: order.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
