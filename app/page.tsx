import Link from "next/link";
import Hero from "@/components/Hero";
import LatestReleases from "@/components/LatestReleases";
import RevealOnScroll from "@/components/RevealOnScroll";
import CountdownTimer from "@/components/CountdownTimer";
import ProductVisual from "@/components/ProductVisual";
import { getProducts, getUpcomingDrop } from "@/lib/cms";
import Image from "next/image";

export default async function HomePage() {
  const [products, drop] = await Promise.all([getProducts(), getUpcomingDrop()]);

  // Non-drop products sorted by release date (most recent first)
  const featured = products
    .filter((p) => !p.dropId) // Exclude drop items
    .sort((a, b) => {
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return dateB - dateA; // Most recent first
    });

  // Check if drop is live or upcoming
  const dropIsLive = drop ? new Date(drop.releaseDate).getTime() <= Date.now() : false;
  const dropCountdownTarget = drop ? (dropIsLive && drop.dueTo ? drop.dueTo : drop.releaseDate) : null;
  const dropLabel = dropIsLive ? "Live Drop" : "Upcoming Drop";
  const dropCTAText = dropIsLive ? "Shop now" : "Notify me";

  return (
    <>
      <Hero />

      <section className="container-lunex py-24 md:py-32">
        <RevealOnScroll className="flex items-end justify-between mb-5 md:mb-7">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-lunex-mute mb-3">Collection</p>
            <h2 className="font-display text-4xl md:text-5xl uppercase">Latest releases</h2>
          </div>
          <Link
            href="/collection"
            className="hidden sm:inline text-xs uppercase tracking-[0.2em] text-lunex-mute hover:text-lunex-white transition-colors"
          >
            View all →
          </Link>
        </RevealOnScroll>

        <LatestReleases products={featured} />

        <Link
          href="/collection"
          className="sm:hidden mt-8 inline-block text-xs uppercase tracking-[0.2em] text-lunex-mute"
        >
          View all →
        </Link>
      </section>

      {drop && dropCountdownTarget && (
        <section className="border-y border-lunex-border bg-lunex-panel/40">
          <div className="container-lunex py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <RevealOnScroll className="aspect-[4/5] border border-lunex-border overflow-hidden max-w-md mx-auto w-full md:max-w-none">
              <ProductVisual
                  image={drop.images?.[0]}
                  className="h-full w-full"
              />
            </RevealOnScroll>
            <RevealOnScroll delay={0.1} className="flex flex-col items-center text-center md:items-start md:text-left">
              <p className="text-xs uppercase tracking-[0.25em] text-lunex-mute mb-4">{dropLabel}</p>
              <h2 className="font-display text-4xl md:text-5xl uppercase mb-5">{drop.name}</h2>
              <p className="text-sm text-lunex-mute max-w-md leading-relaxed mb-8">
                {drop.description}
              </p>
              <CountdownTimer target={dropCountdownTarget} />
              <Link
                href={`/drops/${drop.slug}`}
                className="mt-10 inline-flex items-center px-7 py-3.5 border border-lunex-white text-xs uppercase tracking-[0.2em] hover:bg-lunex-white hover:text-lunex-black transition-colors"
              >
                {dropCTAText}
              </Link>
            </RevealOnScroll>
          </div>
        </section>
      )}

      <section className="container-lunex py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <RevealOnScroll>
          <p className="text-xs uppercase tracking-[0.25em] text-lunex-mute mb-4">About Lunex</p>
          <h2 className="font-display text-4xl md:text-5xl uppercase mb-5 leading-[0.95]">
            We create more than clothing. We create history.
          </h2>
          <p className="text-sm text-lunex-mute max-w-md leading-relaxed mb-8">
            Based in Switzerland, driven by culture, built for the future. Every LUNEX piece
            is produced in limited quantities and never restocked.
          </p>
          <Link
            href="/about"
            className="text-xs uppercase tracking-[0.2em] border-b border-lunex-white pb-1 hover:text-lunex-mute hover:border-lunex-mute transition-colors"
          >
            Learn more
          </Link>
        </RevealOnScroll>
        <RevealOnScroll
            delay={0.1}
            className="relative aspect-square overflow-hidden bg-black"
        >
          <Image
              src="/lunex-tear.png"
              alt="LUNEX torn paper reveal"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={false}
              quality={80}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
        </RevealOnScroll>
      </section>
    </>
  );
}
