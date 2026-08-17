"use client";

import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search } from "lucide-react";
import Link from "next/link";
import { Product } from "@/lib/types";
import ProductVisual from "./ProductVisual";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export default function SearchModal({ isOpen, onClose, products }: SearchModalProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [query, products]);

  // Reset query when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/90 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl mt-20 mx-4"
          >
            <div className="bg-lunex-panel border border-lunex-border">
              {/* Search input */}
              <div className="relative border-b border-lunex-border">
                <Search
                  size={20}
                  strokeWidth={1.5}
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-lunex-mute pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent pl-14 pr-14 py-5 text-base text-lunex-white placeholder:text-lunex-mute focus:outline-none"
                />
                <button
                  onClick={onClose}
                  aria-label="Close search"
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-lunex-mute hover:text-lunex-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {query.trim() === "" ? (
                  <div className="p-8 text-center text-lunex-mute text-sm">
                    Start typing to search products
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-8 text-center text-lunex-mute text-sm">
                    No products found for "{query}"
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-lunex-mute px-4 py-2">
                      {results.length} {results.length === 1 ? "result" : "results"}
                    </p>
                    <div className="space-y-1">
                      {results.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.slug}`}
                          onClick={onClose}
                          className="block p-4 hover:bg-lunex-border/20 transition-colors border border-transparent hover:border-lunex-border"
                        >
                          <div className="flex gap-4">
                            <div className="w-16 h-16 border border-lunex-border shrink-0 bg-lunex-black overflow-hidden">
                              <ProductVisual product={product} size={64} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-display text-lg uppercase truncate">
                                  {product.name}
                                </h3>
                                {product.isNew && (
                                  <span className="bg-lunex-white text-lunex-black text-[9px] uppercase tracking-[0.15em] px-1.5 py-0.5 shrink-0">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-lunex-mute mb-2 line-clamp-2">
                                {product.description}
                              </p>
                              <p className="text-sm font-medium">{product.priceCHF} CHF</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hint */}
            <div className="mt-4 text-center text-xs text-lunex-mute hidden sm:block">
              Press <kbd className="px-2 py-1 bg-lunex-border/30 rounded text-lunex-white">ESC</kbd> to close
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
