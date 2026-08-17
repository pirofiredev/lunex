import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductVisual from "@/components/ProductVisual";
import AddToCartButton from "@/components/AddToCartButton";
import RevealOnScroll from "@/components/RevealOnScroll";
import ProductCard from "@/components/ProductCard";
import { getProductBySlug, getProducts } from "@/lib/cms";
import { PRODUCTS } from "@/lib/data/products";

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const allProducts = await getProducts();
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="container-lunex py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <RevealOnScroll className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:sticky lg:top-24 h-fit">
          {(product.images.length ? product.images : ["x"]).map((_, i) => (
            <div
              key={i}
              className={`aspect-[4/5] border border-lunex-border bg-lunex-panel overflow-hidden ${
                i === 0 ? "sm:col-span-2" : ""
              }`}
            >
              <ProductVisual
                  product={{
                    ...product,
                    images: [product.images[i] ?? product.images[0]],
                  }}
                  seed={i}
                  className="h-full w-full"
              />
            </div>
          ))}
        </RevealOnScroll>

        <RevealOnScroll delay={0.08} className="max-w-lg">
          {product.isNew && (
            <span className="inline-block mb-4 bg-lunex-white text-lunex-black text-[10px] uppercase tracking-[0.15em] px-2.5 py-1">
              New
            </span>
          )}
          <h1 className="font-display text-4xl md:text-5xl uppercase leading-[0.95] mb-3">
            {product.name}
          </h1>
          <p className="text-lg text-lunex-mute mb-8">CHF {product.priceCHF}.00</p>

          <AddToCartButton product={product} />

          <p className="text-sm text-lunex-mute leading-relaxed mt-10">{product.description}</p>

          {product.care && product.care.length > 0 && (
          <details className="mt-8 border-t border-lunex-border pt-4 group">
            <summary className="flex items-center justify-between cursor-pointer text-xs uppercase tracking-[0.2em]">
              Care
              <span className="text-lunex-mute group-open:rotate-45 transition-transform">+</span>
            </summary>
            <ul className="space-y-1.5 text-sm text-lunex-mute">
              {product.care.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </details>
          )}

          <details className="border-t border-lunex-border pt-4 group">
            <summary className="flex items-center justify-between cursor-pointer text-xs uppercase tracking-[0.2em]">
              Shipping
              <span className="text-lunex-mute group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-sm text-lunex-mute leading-relaxed">
              Shipped from Switzerland within 2 business days. Free shipping within Switzerland
              on orders over CHF 150. Duties and taxes calculated at checkout for international
              orders.
            </p>
          </details>
        </RevealOnScroll>
      </div>

      {related.length > 0 && (
        <section className="mt-24 md:mt-32 border-t border-lunex-border pt-16">
          <h2 className="font-display text-3xl md:text-4xl uppercase mb-10">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
