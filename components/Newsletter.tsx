"use client";

import { useState } from "react";
import { subscribeToNewsletter } from "@/lib/cms";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const res = await subscribeToNewsletter(email);
    setStatus(res.ok ? "done" : "error");
    if (res.ok) setEmail("");
  }

  if (status === "done") {
    return <p className="text-sm text-lunex-white">You&apos;re on the list.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-0 max-w-sm">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className="flex-1 bg-transparent border border-lunex-border px-4 py-3 text-sm placeholder:text-lunex-mute focus:border-lunex-white outline-none transition-colors"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 px-4 py-4 sm:py-3 bg-lunex-white text-lunex-black text-xs uppercase tracking-[0.15em] hover:bg-lunex-accent hover:text-lunex-white transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "…" : "Subscribe"}
      </button>
    </form>
  );
}
