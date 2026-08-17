"use client";

import { useState } from "react";
import { useCart } from "@/lib/store/cart";
import CountdownTimer from "@/components/CountdownTimer";
import type { Drop } from "@/lib/types";

interface DropAddToCartProps {
  drop: Drop;
  priceCHF: number;
  sizes: string[];
  stock: Partial<Record<string, number>>;
  dueTo?: string | null;
  buttonClassName?: string;
}

export default function DropAddToCart({ drop, priceCHF, sizes, stock, dueTo, buttonClassName }: DropAddToCartProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const addLine = useCart((state) => state.addLine);

  const isExpired = dueTo ? new Date(dueTo).getTime() <= Date.now() : false;

  const getButtonText = () => {
    if (isAdding) return "Added";
    if (selectedSize) return "Add to cart";
    return "Select size";
  };

  const handleAddToCart = () => {
    if (!selectedSize || isExpired) return;

    setIsAdding(true);
    addLine({
      productId: drop.id,
      slug: drop.slug,
      name: drop.name,
      size: selectedSize,
      priceCHF,
      image: drop.images[0] || "",
      quantity: 1,
    });

    setTimeout(() => {
      setIsAdding(false);
      setSelectedSize(null);
    }, 500);
  };

  if (isExpired) {
    return (
      <div className="max-w-md">
        <p className="text-sm text-lunex-mute">
          This drop has ended and is no longer available.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-lunex-mute mb-3">
          Select size
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const inStock = (stock[size] ?? 0) > 0;
            const isSelected = selectedSize === size;

            return (
              <button
                key={size}
                onClick={() => inStock && setSelectedSize(size)}
                disabled={!inStock}
                className={`
                  px-4 py-3 sm:py-2 text-sm uppercase tracking-wider border transition-colors
                  ${
                    isSelected
                      ? "border-lunex-blue bg-lunex-blue text-gray-400"
                      : inStock
                      ? "border-lunex-border text-lunex-white hover:border-lunex-white cursor-pointer"
                      : "border-lunex-border text-lunex-mute cursor-not-allowed opacity-40"
                  }
                `}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6">
        <p className="font-display text-3xl uppercase">
          {priceCHF} CHF
        </p>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={!selectedSize || isAdding}
        className={
          buttonClassName ||
          `w-full py-5 sm:py-4 text-sm uppercase tracking-[0.2em] border transition-colors text-center ${
            selectedSize && !isAdding
              ? "border-lunex-white bg-lunex-white text-lunex-black hover:bg-transparent hover:text-lunex-white"
              : "border-lunex-border text-lunex-mute cursor-not-allowed"
          }`
        }
      >
        {getButtonText()}
      </button>

      {dueTo && (
        <div className="mt-8 p-4 border border-lunex-border w-full flex flex-col items-center justify-center text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-lunex-mute mb-3">
            Drop ends in
          </p>
          <CountdownTimer target={dueTo} />
        </div>
      )}
    </div>
  );
}

