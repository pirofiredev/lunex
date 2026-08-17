"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { subscribeToNewsletter } from "@/lib/cms";

const STORAGE_KEY = "lunex-newsletter";

export default function NewsletterPopup() {
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);

    const [email, setEmail] = useState("");

    const [status, setStatus] = useState<
        "idle" | "loading" | "success" | "error"
    >("idle");

    useEffect(() => {
        setMounted(true);

        const alreadySeen = localStorage.getItem(STORAGE_KEY);

        if (alreadySeen) return;

        const timer = setTimeout(() => {
            setVisible(true);
            document.body.style.overflow = "hidden";
        }, 8000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") closePopup();
        }

        window.addEventListener("keydown", onKey);

        return () => {
            window.removeEventListener("keydown", onKey);
        };
    }, []);

    function closePopup() {
        localStorage.setItem(STORAGE_KEY, "closed");

        setVisible(false);

        document.body.style.overflow = "";
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!email) return;

        setStatus("loading");

        const result = await subscribeToNewsletter(email);

        if (result.ok) {
            setStatus("success");

            localStorage.setItem(STORAGE_KEY, "subscribed");

            setTimeout(() => {
                setVisible(false);
                document.body.style.overflow = "";
            }, 1800);

            return;
        }

        setStatus("error");
    }

    if (!mounted) return null;

    if (!visible) return null;

    return (
        <div
            onClick={closePopup}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="
          relative
          w-full
          max-w-xl
          border
          border-lunex-border
          bg-[#090909]
          p-8
          md:p-12
          shadow-[0_0_80px_rgba(0,0,0,.65)]
          animate-in
          zoom-in-95
          duration-300
        "
            >
                <button
                    onClick={closePopup}
                    className="
            absolute
            top-5
            right-5
            text-lunex-mute
            hover:text-white
            transition-colors
          "
                >
                    <X size={22} />
                </button>

                <p className="text-[11px] uppercase tracking-[0.35em] text-lunex-mute mb-8">
                    LUNEX
                </p>

                <h2
                    className="
            font-display
            uppercase
            text-5xl
            md:text-6xl
            leading-none
            mb-8
          "
                >
                    Join the
                    <br />
                    Inner Circle
                </h2>

                <p className="text-sm text-lunex-mute leading-7 max-w-md mb-10">
                    Be the first to access every drop.
                    <br />
                    Limited quantities.
                    <br />
                    Never restocked.
                </p>
                {status === "success" ? (
                    <div className="space-y-5 animate-in fade-in duration-300">
                        <div className="w-12 h-[2px] bg-white" />

                        <h3 className="font-display uppercase text-3xl">
                            You're In.
                        </h3>

                        <p className="text-sm leading-7 text-lunex-mute max-w-sm">
                            Thanks for joining the Inner Circle.
                            <br />
                            We'll email you before the next drop goes live.
                        </p>
                    </div>
                ) : (
                    <>
                        <form
                            onSubmit={onSubmit}
                            className="space-y-5"
                        >
                            <input
                                type="email"
                                required
                                autoFocus
                                autoComplete="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="
                  w-full
                  bg-transparent
                  border
                  border-lunex-border
                  px-5
                  py-4
                  text-sm
                  outline-none
                  transition-all
                  placeholder:text-lunex-mute
                  focus:border-white
                "
                            />

                            <button
                                disabled={status === "loading"}
                                type="submit"
                                className="
                  w-full
                  border
                  border-white
                  py-5
                  sm:py-4
                  uppercase
                  tracking-[0.28em]
                  text-sm
                  sm:text-xs
                  transition-all
                  hover:bg-white
                  hover:text-black
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
                            >
                                {status === "loading"
                                    ? "Joining..."
                                    : "Join the List"}
                            </button>
                        </form>

                        <div className="min-h-[22px] mt-2">
                            {status === "error" && (
                                <p className="text-red-400 text-sm">
                                    Something went wrong. Please try again.
                                </p>
                            )}
                        </div>

                        <button
                            onClick={closePopup}
                            className="
                mt-8
                text-xs
                uppercase
                tracking-[0.25em]
                text-lunex-mute
                hover:text-white
                transition-colors
              "
                        >
                            Maybe later
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}