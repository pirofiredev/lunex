"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import ProductVisual from "@/components/ProductVisual";
import ShippingEstimator from "@/components/ShippingEstimator";

export default function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeLine = useCart((s) => s.removeLine);
  const subtotal = useCart((s) => s.subtotal());
  const shipping = useCart((s) => s.shipping);
  const total = useCart((s) => s.total());
  const [checkingOut, setCheckingOut] = useState(false);

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
          cancelUrl: `${window.location.origin}/cart`,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error ?? "Checkout is not configured yet.");
    } finally {
      setCheckingOut(false);
    }
  }

  return (
      <AnimatePresence>
        {isOpen && (
            <>
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={close}
                  className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              />

              <motion.aside
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed right-0 top-0 z-50 h-dvh w-full max-w-md bg-lunex-black border-l border-lunex-border flex flex-col"
                  role="dialog"
                  aria-label="Shopping cart"
              >

                <div className="flex items-center justify-between px-6 py-5 border-b border-lunex-border">
                  <p className="text-xs uppercase tracking-[0.2em]">Cart ({lines.length})</p>

                  <button onClick={close} aria-label="Close cart" className="cursor-pointer">
                    <X size={20} />
                  </button>
                </div>


                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                  {lines.length === 0 && (
                      <p className="text-sm text-lunex-mute py-16 text-center">
                        Your cart is empty.
                      </p>
                  )}


                  {lines.map((line) => {

                    return (
                        <div key={`${line.productId}-${line.size}`} className="flex gap-4">

                          <div className="h-24 w-20 shrink-0 border border-lunex-border bg-lunex-panel overflow-hidden relative">

                            {line.image ? (
                                <Image
                                    src={line.image}
                                    alt={line.name}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                />
                            ) : (
                                <ProductVisual
                                    category="t-shirts"
                                    className="h-full w-full"
                                />
                            )}

                          </div>


                          <div className="flex-1 min-w-0">

                            <div className="flex items-start justify-between gap-2">

                              <p className="text-sm uppercase tracking-[0.05em] truncate">
                                {line.name}
                              </p>

                              <button
                                  onClick={() => removeLine(line.productId, line.size)}
                                  aria-label="Remove item"
                                  className="text-lunex-mute hover:text-lunex-white shrink-0"
                              >
                                <X size={14} />
                              </button>

                            </div>


                            <p className="text-xs text-lunex-mute mt-1">
                              Size {line.size}
                            </p>


                            <div className="flex items-center justify-between mt-3">

                              <div className="flex items-center border border-lunex-border">

                                 <button
                                    className="p-3 sm:p-2"
                                    aria-label="Decrease quantity"
                                    onClick={() => setQuantity(line.productId, line.size, line.quantity - 1)}
                                >
                                  <Minus size={12} />
                                </button>


                                <span className="w-6 text-center text-xs">
                            {line.quantity}
                          </span>


                                 <button
                                    className="p-3 sm:p-2"
                                    aria-label="Increase quantity"
                                    onClick={() => setQuantity(line.productId, line.size, line.quantity + 1)}
                                >
                                  <Plus size={12} />
                                </button>

                              </div>


                              <span className="text-sm">
                          CHF {line.priceCHF * line.quantity}
                        </span>

                            </div>

                          </div>

                        </div>
                    );

                  })}

                </div>


                {lines.length > 0 && (
                    <div className="border-t border-lunex-border px-6 py-6 space-y-4">

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


                      <ShippingEstimator />


                      <div className="flex justify-between border-t border-lunex-border pt-3 text-sm">
                        <span>Total</span>
                        <span>CHF {total}</span>
                      </div>


                      <button
                          onClick={handleCheckout}
                          disabled={checkingOut || !shipping}
                          className="w-full py-5 sm:py-4 text-sm sm:text-xs uppercase tracking-[0.2em] bg-lunex-white text-lunex-black hover:bg-lunex-accent hover:text-lunex-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {checkingOut ? "Redirecting…" : shipping ? "Checkout" : "Calculate shipping first"}
                      </button>

                    </div>
                )}

              </motion.aside>

            </>
        )}
      </AnimatePresence>
  );
}