import { NextRequest, NextResponse } from "next/server";
import { calculateShipping, ALLOWED_SHIPPING_COUNTRIES, ShippingCountry } from "@/lib/shipping";

export async function POST(req: NextRequest) {
  const { country, postalCode } = (await req.json()) as {
    country?: string;
    postalCode?: string;
  };

  if (!country || !postalCode) {
    return NextResponse.json({ error: "Country and postal code are required." }, { status: 400 });
  }

  if (!ALLOWED_SHIPPING_COUNTRIES.includes(country as ShippingCountry)) {
    return NextResponse.json({ error: "We don't currently ship to that country." }, { status: 400 });
  }

  const estimate = await calculateShipping(country as ShippingCountry, postalCode);
  return NextResponse.json(estimate);
}
