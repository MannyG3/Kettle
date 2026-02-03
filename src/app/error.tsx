"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <div className="glass-strong max-w-md rounded-2xl border border-hot-pink/30 p-6 text-center">
        <h1 className="mb-2 text-lg font-bold text-zinc-100">
          Something went wrong
        </h1>
        <p className="mb-4 text-sm font-medium text-zinc-400">
          {error.message}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-neon-green px-4 py-2 text-xs font-bold text-charcoal"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-zinc-200"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
