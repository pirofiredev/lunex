"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[600px] w-full overflow-hidden"
    >
      {/* Background Video */}
      <motion.div
        style={{ y: imageY, scale: imageScale }}
        className="absolute inset-0 z-0"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          <source src="/backgroundvideo.webm" type="video/webm" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-lunex-black via-lunex-black/60 to-lunex-black/40" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="container-lunex relative z-10 flex h-full flex-col justify-center pb-16 pt-32"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-5 flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-lunex-mute"
        >
          <span className="" />
        </motion.p>

        <h1 className="font-display uppercase leading-[0.86] text-[16vw] sm:text-[13vw] md:text-[9vw] lg:text-[6.5rem] xl:text-[7.5rem] max-w-5xl">
          {["History", "Meets", "Streetwear"].map((line, i) => (
            <motion.span
              key={line}
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              {line}
            </motion.span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-9 flex flex-wrap items-center gap-8"
        >
          <Link
            href="/collection"
            className="group relative inline-flex items-center overflow-hidden border border-lunex-white px-8 py-5 sm:py-4 text-sm sm:text-xs uppercase tracking-[0.22em]"
          >
            <span className="absolute inset-0 -translate-x-full bg-lunex-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
            <span className="relative text-lunex-white transition-colors duration-500 group-hover:text-lunex-black">
              Explore collection
            </span>
          </Link>
          <Link
            href="/about"
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-lunex-mute transition-colors hover:text-lunex-white"
          >
            Our Story
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </motion.div>
      </motion.div>

      {/*! Pointless scroll thigy  /*/}
      {/*<motion.div*/}
      {/*  initial={{ opacity: 0 }}*/}
      {/*  animate={{ opacity: 1 }}*/}
      {/*  transition={{ duration: 0.6, delay: 1.2 }}*/}
      {/*  className="absolute bottom-8 right-6 z-10 hidden flex-col items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-lunex-mute md:flex lg:right-10"*/}
      {/*>*/}
      {/*  <span className="flex h-9 w-5 items-start justify-center rounded-full border border-lunex-borderlight p-1.5">*/}
      {/*    <span className="h-1.5 w-1.5 rounded-full bg-lunex-white animate-pulse-slow" />*/}
      {/*  </span>*/}
      {/*  Scroll*/}
      {/*</motion.div>*/}
    </section>
  );
}
