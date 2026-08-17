import Link from "next/link";
import { Metadata } from "next";
import ClearCartOnMount from "@/components/ClearCartOnMount";

export const metadata: Metadata = { title: "Order confirmed" };

export default function CheckoutSuccessPage() {
  return (
    <div className="container-lunex py-32 text-center">
      <ClearCartOnMount />
      <p className="text-xs uppercase tracking-[0.25em] text-lunex-mute mb-4">Thank you</p>
      <h1 className="font-display text-5xl md:text-6xl uppercase mb-5">Order confirmed</h1>
      <p className="text-sm text-lunex-mute max-w-md mx-auto mb-10">
        A confirmation has been sent to your email. Your order will ship from Switzerland
        within 2 business days.
      </p>
      <Link
        href="/collection"
        className="inline-flex items-center px-7 py-3.5 bg-lunex-white text-lunex-black text-xs uppercase tracking-[0.2em] hover:bg-lunex-accent hover:text-lunex-white transition-colors"
      >
        Continue shopping
      </Link>
    </div>
  );
}
