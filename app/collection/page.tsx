import { Metadata } from "next";
import CollectionGrid from "@/components/CollectionGrid";
import { getProducts } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Collection",
  description: "The full LUNEX catalog — t-shirts, hoodies, jackets, and accessories.",
};

export default async function CollectionPage() {
  const products = await getProducts();

  return (
    <div className="container-lunex py-16 md:py-24">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.25em] text-lunex-mute mb-3">Shop</p>
        <h1 className="font-display text-5xl md:text-6xl uppercase">Collection</h1>
      </div>
      <CollectionGrid products={products} />
    </div>
  );
}
