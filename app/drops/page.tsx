import { Metadata } from "next";
import Link from "next/link";
import CountdownTimer from "@/components/CountdownTimer";
import ProductVisual from "@/components/ProductVisual";
import RevealOnScroll from "@/components/RevealOnScroll";
import { getDrops } from "@/lib/cms";
import { isFutureDate } from "@/lib/time";

export const metadata: Metadata = {
  title: "Drops",
  description: "Upcoming and past LUNEX drops. Limited stock, never restocked.",
};

export default async function DropsPage() {
  const drops = await getDrops();

  return (
    <div className="container-lunex py-16 md:py-24">
      <div className="mb-14">
        <p className="text-xs uppercase tracking-[0.25em] text-lunex-mute mb-3">Limited Stock</p>
        <h1 className="font-display text-5xl md:text-6xl uppercase">Drops</h1>
      </div>

      {drops.length === 0 ? (
        <div className="border border-lunex-border p-12 md:p-20 text-center">
          <p className="text-lunex-mute text-sm uppercase tracking-[0.2em] mb-3">Coming Soon</p>
          <h2 className="font-display text-3xl md:text-4xl uppercase mb-6">No Drops Available</h2>
          <p className="text-sm text-lunex-mute max-w-md mx-auto leading-relaxed mb-8">
            We're working on something special. Check out our collection while you wait.
          </p>
          <Link
            href="/collection"
            className="inline-flex items-center px-7 py-3.5 border border-lunex-white text-xs uppercase tracking-[0.2em] hover:bg-lunex-white hover:text-lunex-black transition-colors"
          >
            Shop Collection
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {drops.map((drop) => {
            const now = Date.now();
            const releaseTime = new Date(drop.releaseDate).getTime();
            const dueToTime = drop.dueTo ? new Date(drop.dueTo).getTime() : null;

            const isUpcoming = releaseTime > now;
            const isLive = releaseTime <= now && dueToTime && dueToTime > now;
            const isExpired = dueToTime && dueToTime <= now;

            const countdownTarget = isLive && drop.dueTo ? drop.dueTo : drop.releaseDate;
            const statusLabel = isUpcoming ? "Releases soon" : isLive ? "Live now - ends in" : "Ended";

            return (
              <RevealOnScroll key={drop.id}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border border-lunex-border p-6 md:p-10">
                  <div className="border border-lunex-border overflow-hidden flex items-center justify-center bg-lunex-panel">
                      <img
                          src={drop.images[0]}
                          alt={drop.name}
                          className="w-fcull h-full object-contain"
                      />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-xs uppercase tracking-[0.25em] text-lunex-mute mb-2">
                      {statusLabel}
                    </p>
                    <h2 className="font-display text-3xl md:text-4xl uppercase mb-3">{drop.name}</h2>
                    <p className="text-sm text-lunex-mute leading-relaxed mb-8 max-w-md">
                      {drop.description}
                    </p>
                    {!isExpired && (
                      <>
                        <CountdownTimer target={countdownTarget} className="justify-start" />
                        <Link
                          href={`/drops/${drop.slug}`}
                          className={`mt-8 inline-flex items-center px-7 py-3.5 border text-xs uppercase tracking-[0.2em] w-fit transition-colors ${
                            isLive
                              ? "bg-lunex-white text-lunex-black border-lunex-white hover:bg-transparent hover:text-lunex-white"
                              : "border-lunex-white hover:bg-lunex-white hover:text-lunex-black"
                          }`}
                        >
                          {isLive ? "Shop the drop" : "Notify me"}
                        </Link>
                      </>
                    )}
                    {isExpired && (
                      <p className="text-sm text-lunex-mute">This drop has ended.</p>
                    )}
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      )}
    </div>
  );
}
