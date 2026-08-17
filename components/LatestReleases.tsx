"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import RevealOnScroll from "@/components/RevealOnScroll";

interface LatestReleasesProps {
  products: Product[];
}

export default function LatestReleases({ products }: LatestReleasesProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const desktop = mediaQuery.matches;
    setIsDesktop(desktop);
    setVisibleCount(desktop ? 8 : 5);
    setMounted(true);

    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + (isDesktop ? 8 : 5));
  };

  // Before mount on client, show 8 products so desktop SSR looks full
  const effectiveCount = mounted ? visibleCount : 8;
  const visibleProducts = products.slice(0, effectiveCount);
  const hasMore = visibleProducts.length < products.length;

  if (products.length === 0) {
    return (
      <p className="text-lunex-mute text-sm py-12 text-center">
        No releases available yet.
      </p>
    );
  }

  return (
    <div>
      {/* Scrollable single row on mobile (< 768px), 4-column grid on desktop (>= 768px) */}
      <div className="border-y border-lunex-border py-6 md:py-8 flex overflow-x-auto gap-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-4 md:gap-x-5 md:gap-y-10 md:overflow-visible">
        {visibleProducts.map((product, i) => (
          <div
            key={product.id}
            className="w-[72vw] max-w-[280px] shrink-0 snap-start md:w-auto md:max-w-none md:shrink"
          >
            <RevealOnScroll delay={(i % 8) * 0.04}>
              <ProductCard product={product} index={i} />
            </RevealOnScroll>
          </div>
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="mt-10 md:mt-14 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            className="group relative inline-flex items-center overflow-hidden border border-lunex-white px-8 py-4 sm:py-3.5 text-sm sm:text-xs uppercase tracking-[0.2em] transition-colors hover:bg-lunex-white hover:text-lunex-black cursor-pointer"
          >
            Load more
          </button>
        </div>
      )}

      {!hasMore && products.length > (isDesktop ? 8 : 5) && (
        <div className="mt-10 md:mt-14 text-center">
          <Link
            href="/collection"
            className="text-xs uppercase tracking-[0.2em] text-lunex-mute hover:text-lunex-white transition-colors"
          >
            View full collection →
          </Link>
        </div>
      )}
    </div>
  );
}
