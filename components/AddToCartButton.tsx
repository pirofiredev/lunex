"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import SizeSelector from "@/components/SizeSelector";
import { useCart } from "@/lib/store/cart";

export default function AddToCartButton({ product }: { product: Product }) {
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [justAdded, setJustAdded] = useState(false);
  const addLine = useCart((s) => s.addLine);

  const soldOut = Object.values(product.stock).every((n) => !n);

  function handleAdd() {
    if (!size) return;
    addLine({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size,
      priceCHF: product.priceCHF,
      image: product.images[0],
      quantity: 1,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-lunex-mute mb-3">Size</p>
        <div className="flex justify-start">
          <SizeSelector
            sizes={product.sizes}
            stock={product.stock}
            selected={size}
            onSelect={setSize}
          />
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={soldOut || !size}
        className="w-full py-5 text-sm sm:py-4 sm:text-xs uppercase tracking-[0.2em] bg-lunex-white text-lunex-black hover:bg-lunex-accent hover:text-lunex-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {soldOut ? "Sold out" : justAdded ? "Added to cart" : size ? "Add to cart" : "Select a size"}
      </button>
    </div>
  );
}
