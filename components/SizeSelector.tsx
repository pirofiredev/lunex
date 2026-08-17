"use client";

import clsx from "clsx";

export default function SizeSelector({
  sizes,
  stock,
  selected,
  onSelect,
}: {
  sizes: string[];
  stock: Partial<Record<string, number>>;
  selected: string | null;
  onSelect: (size: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => {
        const available = (stock[size] ?? 0) > 0;
        return (
          <button
            key={size}
            disabled={!available}
            onClick={() => onSelect(size)}
            className={clsx(
              "min-w-[3rem] px-3 py-3.5 sm:py-2.5 text-sm sm:text-xs uppercase tracking-[0.1em] border transition-colors",
              !available && "border-lunex-border text-lunex-mute/40 line-through cursor-not-allowed",
              available && selected === size && "bg-lunex-white text-lunex-black border-lunex-white",
              available &&
                selected !== size &&
                "border-lunex-border hover:border-lunex-borderlight text-lunex-white"
            )}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}
