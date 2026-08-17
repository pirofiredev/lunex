import Link from "next/link";
import Newsletter from "@/components/Newsletter";

export default function Footer() {
  return (
    <footer className="border-t border-lunex-border">
      <div className="container-lunex py-16 md:py-24 grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <p className="font-display text-4xl md:text-5xl tracking-widest2 uppercase mb-4">
            Lunex
          </p>
          <p className="text-sm text-lunex-mute max-w-xs leading-relaxed">
            Premium streetwear from Switzerland. History, exclusivity, limited drops.
          </p>
          <div className="flex gap-6 mt-6 text-xs uppercase tracking-[0.2em] text-lunex-mute">
            <a href="#" className="hover:text-lunex-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-lunex-white transition-colors">TikTok</a>
            <a href="#" className="hover:text-lunex-white transition-colors">YouTube</a>
          </div>
        </div>

        <div className="md:col-span-3 flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-lunex-mute mb-2">Shop</p>
          <Link href="/collection" className="text-sm hover:text-lunex-mute transition-colors">Collection</Link>
          <Link href="/drops" className="text-sm hover:text-lunex-mute transition-colors">Upcoming Drop</Link>
          <Link href="/cart" className="text-sm hover:text-lunex-mute transition-colors">Cart</Link>
          <Link href="/about" className="text-sm hover:text-lunex-mute transition-colors">About</Link>
        </div>
      </div>

      <div className="container-lunex py-6 border-t border-lunex-border flex flex-col sm:flex-row gap-2 justify-between text-[11px] uppercase tracking-[0.15em] text-lunex-mute">
        <span>© {new Date().getFullYear()} Lunex. All rights reserved.</span>
        <span>Based in Switzerland</span>
      </div>
    </footer>
  );
}
