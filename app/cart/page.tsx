"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import ProductVisual from "@/components/ProductVisual";
import ShippingEstimator from "@/components/ShippingEstimator";
import { getProducts } from "@/lib/cms";

export default function CartPage() {
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeLine = useCart((s) => s.removeLine);
  const subtotal = useCart((s) => s.subtotal());
  const shipping = useCart((s) => s.shipping);
  const total = useCart((s) => s.total());

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  if (lines.length === 0) {
    return (
        <div className="container-lunex py-32 text-center">
          <h1 className="font-display text-4xl uppercase mb-4">Your cart is empty</h1>
          <p className="text-sm text-lunex-mute mb-8">Find something from the current collection.</p>
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
        <h1 className="font-display text-5xl md:text-6xl uppercase mb-12">Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {lines.some((line) => !products.find((p) => p.id === line.productId)) && (
              <div className="mb-6 p-4 border border-lunex-accent/50 bg-lunex-accent/10 text-sm">
                <p className="text-lunex-accent">
                  Some items in your cart are no longer available.
                </p>
                <button
                  onClick={() => {
                    lines
                      .filter((line) => !products.find((p) => p.id === line.productId))
                      .forEach((line) => removeLine(line.productId, line.size));
                  }}
                  className="mt-2 text-xs uppercase tracking-[0.15em] underline hover:no-underline"
                >
                  Remove unavailable items
                </button>
              </div>
            )}

            <div className="divide-y divide-lunex-border border-t border-b border-lunex-border">
              {lines.map((line) => {
                const product = products.find((p) => p.id === line.productId);
                if (!product) return null;
                return (
                  <div key={`${line.productId}-${line.size}`} className="flex gap-5 py-6">
                    <div className="h-28 w-24 shrink-0 border border-lunex-border bg-lunex-panel overflow-hidden">
                      <ProductVisual
                          product={product}
                          className="h-full w-full"
                      />
                    </div>

                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-[0.05em]">{line.name}</p>
                        <p className="text-xs text-lunex-mute mt-1">Size {line.size}</p>
                        <p className="text-sm mt-2 sm:hidden">
                          CHF {line.priceCHF * line.quantity}
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center border border-lunex-border">
                          <button
                              className="p-3.5 sm:p-2.5"
                              aria-label="Decrease quantity"
                              onClick={() =>
                                  setQuantity(line.productId, line.size, line.quantity - 1)
                              }
                          >
                            <Minus size={13} />
                          </button>

                          <span className="w-6 text-center text-xs">
                        {line.quantity}
                      </span>

                          <button
                              className="p-3.5 sm:p-2.5"
                              aria-label="Increase quantity"
                              onClick={() =>
                                  setQuantity(line.productId, line.size, line.quantity + 1)
                              }
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <span className="hidden sm:inline text-sm w-16 text-right">
                      CHF {line.priceCHF * line.quantity}
                    </span>

                        <button
                            onClick={() => removeLine(line.productId, line.size)}
                            aria-label="Remove item"
                            className="text-lunex-mute hover:text-lunex-white"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border border-lunex-border p-6 h-fit space-y-5">
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

            <div className="flex justify-between border-t border-lunex-border pt-4 text-base">
              <span>Total</span>
              <span>CHF {total}</span>
            </div>

            <Link
                href="/checkout"
                className="block w-full py-5 sm:py-4 text-sm sm:text-xs uppercase tracking-[0.2em] text-center bg-lunex-white text-lunex-black hover:bg-lunex-accent hover:text-lunex-white transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
  );
}