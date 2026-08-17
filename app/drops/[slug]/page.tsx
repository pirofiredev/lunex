import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductVisual from "@/components/ProductVisual";
import CountdownTimer from "@/components/CountdownTimer";
import ProductCard from "@/components/ProductCard";
import Newsletter from "@/components/Newsletter";
import RevealOnScroll from "@/components/RevealOnScroll";
import DropAddToCart from "@/components/DropAddToCart";
import { getDrops, getProducts } from "@/lib/cms";
import { DROPS } from "@/lib/data/products";
import { isFutureDate } from "@/lib/time";

export async function generateStaticParams() {
  return DROPS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const drops = await getDrops();
  const drop = drops.find((d) => d.slug === slug);
  if (!drop) return {};
  return { title: drop.name, description: drop.description };
}

export default async function DropDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [drops, products] = await Promise.all([getDrops(), getProducts()]);
  const drop = drops.find((d) => d.slug === slug);
  if (!drop) notFound();

  const dropProducts = products.filter((p) => p.dropId === drop.id);

  const now = Date.now();
  const releaseTime = new Date(drop.releaseDate).getTime();
  const dueToTime = drop.dueTo ? new Date(drop.dueTo).getTime() : null;

  const isUpcoming = releaseTime > now;
  const isLive = releaseTime <= now && (!dueToTime || dueToTime > now);
  const isExpired = dueToTime && dueToTime <= now;

  const countdownTarget = isLive && drop.dueTo ? drop.dueTo : drop.releaseDate;
  const statusLabel = isUpcoming ? "Releasing soon" : isLive ? "Available now" : "Ended";

  return (
    <div className="container-lunex py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <RevealOnScroll className="aspect-[4/5] border border-lunex-border overflow-hidden">
          <img
              src={drop.images[0]}
              alt={drop.name}
              className="h-full w-full object-cover"
          />
        </RevealOnScroll>
        <RevealOnScroll delay={0.1}>
          <p className="text-xs uppercase tracking-[0.25em] text-lunex-mute mb-4">
            {statusLabel}
          </p>
          <h1 className="font-display text-5xl md:text-6xl uppercase mb-5">{drop.name}</h1>
          <p className="text-sm text-lunex-mute leading-relaxed max-w-md mb-8">
            {drop.description}
          </p>
          {isExpired ? (
            <p className="text-sm text-lunex-mute">This drop has ended and is no longer available.</p>
          ) : isUpcoming ? (
            <>
              <CountdownTimer target={drop.releaseDate} />
              <div className="mt-10 max-w-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-lunex-mute mb-3">
                  Get notified at release
                </p>
                <Newsletter />
              </div>
            </>
          ) : (
            <>
              {drop.priceCHF && drop.sizes && drop.stock ? (
                <DropAddToCart
                  drop={drop}
                  priceCHF={drop.priceCHF}
                  sizes={drop.sizes}
                  stock={drop.stock}
                  dueTo={drop.dueTo}
                />
              ) : (
                <>
                  {drop.dueTo && (
                    <div className="mb-8 p-4 border border-lunex-border w-full flex flex-col items-center justify-center text-center">
                      <p className="text-xs uppercase tracking-[0.2em] text-lunex-mute mb-3">
                        Drop ends in
                      </p>
                      <CountdownTimer target={drop.dueTo} />
                    </div>
                  )}
                  <p className="text-sm text-lunex-white">This drop is live — shop below.</p>
                </>
              )}
            </>
          )}
        </RevealOnScroll>
      </div>

      {dropProducts.length > 0 && (
        <section className="border-t border-lunex-border pt-16">
          <h2 className="font-display text-3xl md:text-4xl uppercase mb-10">In this drop</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {dropProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
