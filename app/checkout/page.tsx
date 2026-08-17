"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/store/cart";
import ProductVisual from "@/components/ProductVisual";
import ShippingEstimator from "@/components/ShippingEstimator";
import { getProducts } from "@/lib/cms";

export default function CheckoutPage() {
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.subtotal());
  const shipping = useCart((s) => s.shipping);
  const total = useCart((s) => s.total());
  const [checkingOut, setCheckingOut] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  async function handleCheckout() {
    if (!shipping) return;
    setCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          shipping,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout`,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? "Checkout is not configured yet.");
    } finally {
      setCheckingOut(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="container-lunex py-32 text-center">
        <h1 className="font-display text-4xl uppercase mb-4">Your cart is empty</h1>
        <p className="text-sm text-lunex-mute mb-8">Add items to your cart before checking out.</p>
        <Link
          href="/collection"
          className="inline-flex items-center px-7 py-4 sm:py-3.5 bg-lunex-white text-lunex-black text-xs uppercase tracking-[0.2em] hover:bg-lunex-accent hover:text-lunex-white transition-colors"
        >
          Shop Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container-lunex py-16 md:py-24">
      <h1 className="font-display text-5xl md:text-6xl uppercase mb-12">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Order Summary */}
        <div className="lg:col-span-2">
          <h2 className="font-display text-2xl uppercase mb-6">Order Summary</h2>

          {lines.some((line) => !products.find((p) => p.id === line.productId)) && (
            <div className="mb-6 p-4 border border-lunex-accent/50 bg-lunex-accent/10 text-sm">
              <p className="text-lunex-accent">
                Some items in your cart are no longer available and have been removed from checkout.
              </p>
            </div>
          )}

          <div className="divide-y divide-lunex-border border-t border-b border-lunex-border">
            {lines
              .filter((line) => products.find((p) => p.id === line.productId))
              .map((line) => {
                const product = products.find((p) => p.id === line.productId)!;
                return (
                  <div key={`${line.productId}-${line.size}`} className="flex gap-5 py-6">
                    <div className="h-24 w-20 shrink-0 border border-lunex-border bg-lunex-panel overflow-hidden">
                      <ProductVisual
                        product={product}
                        className="h-full w-full"
                      />
                    </div>

                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.05em]">{line.name}</p>
                        <p className="text-xs text-lunex-mute mt-1">
                          Size {line.size} × {line.quantity}
                        </p>
                      </div>

                      <span className="text-sm">
                        CHF {line.priceCHF * line.quantity}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Payment Details */}
        <div className="border border-lunex-border p-6 h-fit space-y-5">
          <h2 className="font-display text-xl uppercase mb-4">Payment</h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-lunex-mute">Subtotal</span>
              <span>CHF {subtotal}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-lunex-mute">Shipping</span>
              <span>{shipping ? `CHF ${shipping.amountCHF}` : "—"}</span>
            </div>
          </div>

          <div className="border-t border-lunex-border pt-4">
            <ShippingEstimator />
          </div>

          <div className="flex justify-between border-t border-lunex-border pt-4 text-base font-medium">
            <span>Total</span>
            <span>CHF {total}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={checkingOut || !shipping}
            className="w-full py-5 sm:py-4 text-sm sm:text-xs uppercase tracking-[0.2em] bg-lunex-white text-lunex-black hover:bg-lunex-accent hover:text-lunex-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkingOut
              ? "Redirecting to payment…"
              : shipping
                ? "Proceed to Payment"
                : "Calculate shipping first"}
          </button>

          <Link
            href="/cart"
            className="block w-full py-5 sm:py-4 text-sm sm:text-xs uppercase tracking-[0.2em] text-center border border-lunex-border hover:bg-lunex-border/20 transition-colors"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
