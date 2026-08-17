import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { sendOrderNotificationEmail, sendOrderConfirmationEmail } from "@/lib/email";
import Stripe from "stripe";

// Stripe's Node SDK types lag slightly behind API field renames (e.g.
// `shipping_details` superseding `shipping` on Checkout Session). This shape
// covers both so the address is read correctly regardless of API version.
interface ShippingLike {
  name?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    if (!signature || !webhookSecret) throw new Error("Missing webhook signature/secret.");
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const sessionSummary = event.data.object as Stripe.Checkout.Session;

    // The webhook payload doesn't include line items by default — fetch the
    // full session with them expanded.
    const session = await stripe.checkout.sessions.retrieve(sessionSummary.id, {
      expand: ["line_items"],
    });

    const shipping = (session as unknown as { shipping_details?: ShippingLike; shipping?: ShippingLike })
      .shipping_details ?? (session as unknown as { shipping?: ShippingLike }).shipping ?? null;

    const shippingAddress = shipping?.address
      ? {
          line1: shipping.address.line1 ?? null,
          line2: shipping.address.line2 ?? null,
          city: shipping.address.city ?? null,
          postalCode: shipping.address.postal_code ?? null,
          country: shipping.address.country ?? null,
        }
      : null;

    const lineItems = (session.line_items?.data ?? []).map((item) => ({
      name: item.description ?? "Item",
      quantity: item.quantity ?? 1,
    }));

    const shippingCHF = (session.total_details?.amount_shipping ?? 0) / 100;

    const orderPayload = {
      orderId: session.id,
      email: session.customer_details?.email ?? null,
      phone: session.customer_details?.phone ?? null,
      customerName: shipping?.name ?? session.customer_details?.name ?? null,
      shippingAddress,
      shippingCHF,
      lineItems,
      totalCHF: (session.amount_total ?? 0) / 100,
    };

    const supabase = getSupabaseServiceClient();
    if (supabase) {
      // Write order to database
      await supabase.from("orders").insert({
        stripe_session_id: session.id,
        email: orderPayload.email,
        phone: orderPayload.phone,
        customer_name: orderPayload.customerName,
        shipping_address: shippingAddress,
        shipping_chf: shippingCHF,
        line_items: lineItems,
        total_chf: orderPayload.totalCHF,
        status: "paid",
      });

      // Decrement stock for each purchased item
      // Line item names are formatted as "Product Name — SIZE" from checkout route
      for (const item of session.line_items?.data ?? []) {
        const description = item.description ?? "";
        const quantity = item.quantity ?? 0;

        // Parse "Product Name — SIZE" format
        const match = description.match(/^(.+?)\s+—\s+([A-Z]{1,3}|One Size)$/i);
        if (!match) {
          console.warn(`[Webhook] Could not parse line item: "${description}"`);
          continue;
        }

        const [, productName, size] = match;

        // Find product by name
        const { data: products } = await supabase
          .from("products")
          .select("id")
          .eq("name", productName.trim())
          .limit(1);

        if (!products?.length) {
          console.warn(`[Webhook] Product not found: "${productName}"`);
          continue;
        }

        const productId = products[0].id;

        // Decrement stock in products_stock table
        // Database stores sizes in lowercase
        const { data: stockRow, error: fetchError } = await supabase
          .from("products_stock")
          .select("quantity")
          .eq("_parent_id", productId)
          .eq("size", size.toLowerCase())
          .single();

        if (fetchError || !stockRow) {
          console.warn(`[Webhook] Stock row not found for product ${productId}, size ${size}`);
          continue;
        }

        const newQuantity = Math.max(0, stockRow.quantity - quantity);

        const { error: updateError } = await supabase
          .from("products_stock")
          .update({ quantity: newQuantity })
          .eq("_parent_id", productId)
          .eq("size", size.toLowerCase());

        if (updateError) {
          console.error(`[Webhook] Failed to decrement stock for product ${productId}, size ${size}:`, updateError);
        }
      }
    }

    // Both are safe no-ops if RESEND_API_KEY / ORDER_NOTIFICATION_EMAIL aren't set.
    await Promise.all([
      sendOrderNotificationEmail(orderPayload),
      sendOrderConfirmationEmail(orderPayload),
    ]);
  }

  return NextResponse.json({ received: true });
}
