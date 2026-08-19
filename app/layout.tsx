import NewsletterPopup from "@/components/NewsletterPopup";
import type { Metadata, Viewport } from "next";
import "@fontsource/bebas-neue/latin-400.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { getProducts } from "@/lib/cms";

// Never bake CMS data into static builds — fetch fresh on every request
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "LUNEX — Streetwear from Switzerland",
    template: "%s · LUNEX",
  },
  description:
    "LUNEX is a premium streetwear brand based in Switzerland. History, exclusivity, limited drops.",
  openGraph: {
    title: "LUNEX — Streetwear from Switzerland",
    description: "History meets streetwear. Limited drops, based in Switzerland.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const products = await getProducts();

  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh flex flex-col bg-lunex-black text-lunex-white font-body antialiased">
        <Header products={products} />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <NewsletterPopup />
      </body>
    </html>
  );
}
