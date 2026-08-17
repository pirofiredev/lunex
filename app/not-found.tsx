import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-lunex py-32 text-center">
      <p className="font-display text-8xl md:text-9xl mb-6">404</p>
      <h1 className="text-lg uppercase tracking-[0.2em] mb-4">Page not found</h1>
      <p className="text-sm text-lunex-mute mb-10">
        This piece isn&apos;t in the current collection.
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-7 py-3.5 bg-lunex-white text-lunex-black text-xs uppercase tracking-[0.2em] hover:bg-lunex-accent hover:text-lunex-white transition-colors"
      >
        Back home
      </Link>
    </div>
  );
}
