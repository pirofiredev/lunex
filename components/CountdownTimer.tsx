"use client";

import { useEffect, useState } from "react";

function getRemaining(target: string) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, done: diff <= 0 };
}

export default function CountdownTimer({ target, className }: { target: string; className?: string }) {
  const [time, setTime] = useState(() => getRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setTime(getRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units: [string, number][] = [
    ["Days", time.days],
    ["Hours", time.hours],
    ["Minutes", time.minutes],
    ["Seconds", time.seconds],
  ];

  if (time.done) {
    return <p className="text-lg uppercase tracking-[0.2em]">Live now</p>;
  }

  return (
    <div className={`flex gap-4 md:gap-6 ${className ?? "justify-center"}`} role="timer" aria-live="polite">
      {units.map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <span className="font-display text-4xl md:text-5xl tabular-nums">
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-lunex-mute mt-1">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
