"use client";

import { useMemo, useState } from "react";
import { Product, ProductCategory } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import RevealOnScroll from "@/components/RevealOnScroll";
import { Search } from "lucide-react";

function capitalizeCategory(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function CollectionGrid({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<"all" | ProductCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamically generate category filters from products
  const filters = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
    return [
      { label: "All", value: "all" as const },
      ...uniqueCategories.map(cat => ({
        label: capitalizeCategory(cat),
        value: cat
      }))
    ];
  }, [products]);

  const filtered = useMemo(() => {
    let result = filter === "all" ? products : products.filter((p) => p.category === filter);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [filter, products, searchQuery]);

  return (
    <div>
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <Search
            size={18}
            strokeWidth={1.5}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-lunex-mute pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border border-lunex-border pl-12 pr-4 py-3 text-sm text-lunex-white placeholder:text-lunex-mute focus:outline-none focus:border-lunex-white transition-colors"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-10">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-3 sm:py-2 text-sm sm:text-xs uppercase tracking-[0.15em] border transition-colors ${
              filter === f.value
                ? "bg-lunex-white text-lunex-black border-lunex-white"
                : "border-lunex-border text-lunex-mute hover:text-lunex-white hover:border-lunex-borderlight"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-lunex-mute text-sm py-24 text-center">
          {searchQuery.trim() ? "No products match your search." : "Nothing in this category yet, check back for the next drop."}
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {filtered.map((product, i) => (
            <RevealOnScroll key={product.id} delay={(i % 8) * 0.04}>
              <ProductCard product={product} index={i} />
            </RevealOnScroll>
          ))}
        </div>
      )}
    </div>
  );
}
