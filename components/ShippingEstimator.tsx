"use client";

import { useState } from "react";
import { useCart } from "@/lib/store/cart";
import {
  ALLOWED_SHIPPING_COUNTRIES,
  COUNTRY_LABELS,
  ShippingCountry,
} from "@/lib/shipping";

export default function ShippingEstimator() {
  const shipping = useCart((s) => s.shipping);
  const setShipping = useCart((s) => s.setShipping);

  const [country, setCountry] = useState<ShippingCountry>("CH");
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEstimate(e: React.FormEvent) {
    e.preventDefault();
    if (!postalCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/shipping-estimate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ country, postalCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Couldn't calculate shipping for that address.");
        return;
      }

      setShipping({
        country,
        postalCode,
        amountCHF: data.amountCHF,
        distanceKm: data.distanceKm,
      });
    } finally {
      setLoading(false);
    }
  }

  if (shipping) {
    return (
        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="min-w-0">
            <p className="truncate text-lunex-mute">
              Shipping to {COUNTRY_LABELS[shipping.country]} · {shipping.postalCode}
              {shipping.distanceKm != null && (
                  <span className="text-lunex-mute/70">
                {" "}
                    · ~{shipping.distanceKm} km from Geneva
              </span>
              )}
            </p>
          </div>

          <button
              type="button"
              onClick={() => setShipping(null)}
              className="shrink-0 text-xs uppercase tracking-[0.15em] text-lunex-mute underline hover:text-lunex-white"
          >
            Change
          </button>
        </div>
    );
  }

  return (
      <form onSubmit={handleEstimate} className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-lunex-mute">
          Calculate shipping from Geneva
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
              value={country}
              onChange={(e) => setCountry(e.target.value as ShippingCountry)}
              className="w-full sm:w-[110px] min-w-0 border border-lunex-border bg-lunex-black px-2 py-2 text-sm outline-none focus:border-lunex-white"
          >
            {ALLOWED_SHIPPING_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {COUNTRY_LABELS[c]}
                </option>
            ))}
          </select>

          <input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Postal code"
              className="min-w-0 flex-1 border border-lunex-border bg-transparent px-2 py-2 text-sm placeholder:text-lunex-mute outline-none focus:border-lunex-white"
          />

          <button
              type="submit"
              disabled={loading}
              className="shrink-0 whitespace-nowrap bg-lunex-white px-3 py-3 sm:py-2 text-[11px] uppercase tracking-[0.1em] text-lunex-black transition-colors hover:bg-lunex-accent hover:text-lunex-white disabled:opacity-50"
          >
            {loading ? "…" : "Estimate"}
          </button>
        </div>

        {error && <p className="text-xs text-lunex-mute">{error}</p>}
      </form>
  );
}