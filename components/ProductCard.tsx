import Link from "next/link";
import { Product } from "@/lib/types";
import ProductVisual from "@/components/ProductVisual";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const soldOut = Object.values(product.stock).every((n) => !n);

  return (
    <Link href={`/product/${product.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden bg-lunex-panel">
          <ProductVisual
              product={product}
              seed={index}
              className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        {product.isNew && !soldOut && (
          <span className="absolute top-3 left-3 bg-lunex-white text-lunex-black text-[10px] uppercase tracking-[0.15em] px-2.5 py-1">
            New
          </span>
        )}
        {soldOut && (
          <span className="absolute top-3 left-3 bg-lunex-black border border-lunex-borderlight text-lunex-mute text-[10px] uppercase tracking-[0.15em] px-2.5 py-1">
            Sold out
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="text-sm uppercase tracking-[0.08em] group-hover:text-lunex-mute transition-colors">
          {product.name}
        </h3>
        <span className="text-sm text-lunex-mute whitespace-nowrap">CHF {product.priceCHF}</span>
      </div>
    </Link>
  );
}
