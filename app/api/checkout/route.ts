import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { CartLine } from "@/lib/types";
import { ShippingCountry } from "@/lib/shipping";
import { getSupabaseServiceClient } from "@/lib/supabase";

interface ShippingInput {
  country: ShippingCountry;
  postalCode: string;
  amountCHF: number;
  distanceKm: number | null;
}

export async function POST(req: NextRequest) {
  try {
    const { lines, shipping, successUrl, cancelUrl } = (await req.json()) as {
      lines: CartLine[];
      shipping?: ShippingInput;
      successUrl: string;
      cancelUrl: string;
    };

    if (!lines?.length) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }
    if (!shipping) {
      return NextResponse.json(
        { error: "Calculate a shipping quote before checking out." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Stock validation — skipped if Supabase isn't configured (allows testing
    // Stripe flow with static fallback data)
    if (supabase) {
      for (const line of lines) {
        // Try to find as product first
        const { data: productData, error: productError } = await supabase
            .from("products")
            .select("id")
            .eq("id", line.productId)
            .single();

        // If not a product, try as a drop
        const { data: dropData, error: dropError } = await supabase
            .from("drops")
            .select("id")
            .eq("id", line.productId)
            .single();

        if ((!productData && productError) && (!dropData && dropError)) {
          return NextResponse.json(
              { error: `"${line.name}" not found.` },
              { status: 400 }
          );
        }

        let stock: Record<string, number> = {};

        if (productData) {
          // Fetch stock from products stock table
          const { data: stockData, error: stockError } = await supabase
              .from("stock")
              .select("size, quantity")
              .eq("productid", line.productId);

          if (stockError) {
            return NextResponse.json(
                { error: `Could not check stock for "${line.name}".` },
                { status: 500 }
            );
          }

          // Build stock object from stock rows
          stockData?.forEach((item: any) => {
            stock[item.size?.toUpperCase()] = item.quantity ?? 0;
          });
        } else if (dropData) {
          // Fetch stock from dropsstock table
          const { data: dropStockData, error: dropStockError } = await supabase
              .from("dropsstock")
              .select("sizes, quantity")
              .eq("dropId", line.productId);

          if (dropStockError) {
            return NextResponse.json(
                { error: `Could not check stock for "${line.name}".` },
                { status: 500 }
            );
          }

          // Build stock object from dropsstock rows
          dropStockData?.forEach((item: any) => {
            stock[item.sizes?.toUpperCase()] = item.quantity ?? 0;
          });
        }

        const available = stock[line.size.toUpperCase()] ?? 0;

        if (line.quantity > available) {
          return NextResponse.json(
              {
                error: `Only ${available} item(s) left in stock for "${line.name}" size ${line.size}.`,
              },
              { status: 400 }
          );
        }
      }
    }

    const stripe = getStripe();

    const line_items = lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: "chf",
        unit_amount: Math.round(line.priceCHF * 100),
        product_data: {
          name: `${line.name} — ${line.size}`,
          // Images disabled for local dev — Stripe requires publicly accessible URLs
          // Example: http://serverip:3001/api/media/file/c0333109-7972-48c9-a3a9-e59e4df883ad-Photoroom.png
          images: undefined,
        },
      },
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      // Disable Managed Payments to use manual shipping configuration
      managed_payments: { enabled: false },
      // Locked to the single country the shipping quote was calculated for —
      // the customer already confirmed this before reaching Stripe, so the
      // quoted price and the address they enter here always match.
      shipping_address_collection: { allowed_countries: [shipping.country] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: Math.round(shipping.amountCHF * 100), currency: "chf" },
            display_name:
              shipping.distanceKm != null
                ? `Shipping from Geneva (~${shipping.distanceKm} km)`
                : "Shipping from Geneva",
          },
        },
      ],
      phone_number_collection: { enabled: true },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not start checkout. Check your Stripe configuration." },
      { status: 500 }
    );
  }
}
