"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, Search } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import SearchModal from "@/components/SearchModal";
import { Product } from "@/lib/types";
import clsx from "clsx";

const NAV = [
  { href: "/collection", label: "Collection" },
  { href: "/drops", label: "Drops" },
  { href: "/about", label: "About" },
];

interface HeaderProps {
  products?: Product[];
}

export default function Header({ products = [] }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() =>
    typeof window !== "undefined" ? window.scrollY > 8 : false
  );
  const pathname = usePathname();
  const openCart = useCart((s) => s.open);
  const count = useCart((s) => s.count());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 w-full transition-colors duration-300 h-auto",
        scrolled ? "bg-black/85 backdrop-blur-md border-b border-lunex-border" : "bg-transparent"
      )}
    >
      <div className="container-lunex grid h-16 grid-cols-[1fr_auto] items-center gap-6 md:h-20 md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" aria-label="LUNEX home" className="relative h-15 w-30 shrink-0 md:h-9 md:w-32">
          <Image
            src="/logo.svg"
            alt="LUNEX"
            fill
            priority
            sizes="128px"
            className="object-contain object-left"
          />
        </Link>

        {/* Center: nav (desktop only) */}
        <nav className="hidden items-center gap-10 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "cursor-pointer text-sm uppercase tracking-[0.2em] text-lunex-mute transition-colors hover:text-lunex-white",
                pathname === item.href && "text-lunex-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: search + cart + mobile menu toggle */}
        <div className="flex items-center justify-end gap-7 md:gap-8">
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search products"
            className="cursor-pointer transition-colors hover:text-lunex-mute"
          >
            <Search size={19} strokeWidth={1.5} />
          </button>

          <button
            onClick={openCart}
            aria-label={`Open cart, ${count} items`}
            className="cursor-pointer relative flex items-center gap-2 text-xs uppercase tracking-[0.2em] transition-colors hover:text-lunex-mute"
          >
            <ShoppingBag size={16} strokeWidth={1.5} />
            <span className="hidden sm:inline">Cart ({count})</span>
          </button>

          <button
            className="cursor-pointer md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      <div
        className={clsx(
          "overflow-hidden border-b border-lunex-border transition-[max-height] duration-300 ease-out md:hidden",
          menuOpen ? "max-h-64" : "max-h-0 border-b-0"
        )}
      >
        <nav className="container-lunex flex flex-col gap-1 pb-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="cursor-pointer border-b border-lunex-border py-3 text-sm uppercase tracking-[0.2em] text-lunex-mute last:border-b-0 hover:text-lunex-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} products={products} />
    </header>
  );
}
