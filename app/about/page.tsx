import { Metadata } from "next";
import RevealOnScroll from "@/components/RevealOnScroll";
import TopoBackground from "@/components/TopoBackground";

export const metadata: Metadata = {
  title: "About",
  description: "The LUNEX story — history, exclusivity, and limited drops from Switzerland.",
};

const VALUES = [
  {
    title: "History",
    body: "Every silhouette references the archive — reworked, never copied.",
  },
  {
    title: "Exclusivity",
    body: "Production runs are fixed at the start of each drop and never extended.",
  },
  {
    title: "Craft",
    body: "Cut, sewn, and finished in small batches, with materials chosen to outlast a season.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative border-b border-lunex-border overflow-hidden">
        <TopoBackground className="absolute inset-0 h-full w-full opacity-40" />
        <div className="container-lunex relative py-24 md:py-36">
          <RevealOnScroll>
            <p className="text-xs uppercase tracking-[0.25em] text-lunex-mute mb-4">About Lunex</p>
            <h1 className="font-display text-5xl md:text-7xl uppercase leading-[0.9] max-w-3xl">
              History meets streetwear
            </h1>
          </RevealOnScroll>
        </div>
      </section>

      <section className="container-lunex py-20 md:py-28 grid grid-cols-1 md:grid-cols-2 gap-12">
        <RevealOnScroll>
          <h2 className="font-display text-3xl md:text-4xl uppercase mb-5">Our story</h2>
          <p className="text-sm text-lunex-mute leading-relaxed mb-4">
            LUNEX was founded in Switzerland with a simple premise: streetwear can carry the
            same weight as heritage craft. Every collection begins with the Alpine landscape —
            its contour lines, its restraint — translated into cut, fabric, and finish.
          </p>
          <p className="text-sm text-lunex-mute leading-relaxed">
            We produce in limited runs by design. When a drop sells out, it stays out — a
            record of a specific moment rather than a permanent line.
          </p>
        </RevealOnScroll>
        <RevealOnScroll delay={0.1}>
          <h2 className="font-display text-3xl md:text-4xl uppercase mb-5">Founders</h2>
          <p className="text-sm text-lunex-mute leading-relaxed">
            LUNEX is built by a small team of designers and pattern-makers based between
            Zurich and Geneva, working directly with a handful of European mills and
            manufacturers to keep every piece traceable from fabric to finished garment.
          </p>
        </RevealOnScroll>
      </section>

      <section className="border-t border-lunex-border">
        <div className="container-lunex py-20 md:py-28">
          <RevealOnScroll>
            <h2 className="font-display text-3xl md:text-4xl uppercase mb-12">Values</h2>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {VALUES.map((v, i) => (
              <RevealOnScroll key={v.title} delay={i * 0.08}>
                <p className="text-xs uppercase tracking-[0.2em] text-lunex-mute mb-3">
                  0{i + 1}
                </p>
                <h3 className="font-display text-2xl uppercase mb-3">{v.title}</h3>
                <p className="text-sm text-lunex-mute leading-relaxed">{v.body}</p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
