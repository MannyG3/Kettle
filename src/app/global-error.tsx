"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#1a1a1c", color: "#e5e7eb", fontFamily: "system-ui, sans-serif", padding: "2rem", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: "28rem", textAlign: "center", padding: "1.5rem", border: "1px solid rgba(255,0,110,0.3)", borderRadius: "1rem", background: "rgba(26,26,28,0.9)" }}>
          <h1 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "0.875rem", marginBottom: "1rem", color: "#a1a1aa" }}>
            {error.message}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{ padding: "0.5rem 1rem", borderRadius: "9999px", background: "#39ff14", color: "#1a1a1c", border: "none", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{ padding: "0.5rem 1rem", borderRadius: "9999px", border: "1px solid rgba(255,255,255,0.2)", color: "#e5e7eb", fontWeight: 700, fontSize: "0.75rem", textDecoration: "none" }}
            >
              Back to home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
