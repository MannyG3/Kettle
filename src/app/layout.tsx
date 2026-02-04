import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import Link from "next/link";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Tea — Anonymous Gen Z Kettles",
  description:
    "Spill anonymous Gen Z tea in high-energy themed kettles. No profiles, only vibes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${archivo.variable} font-sans antialiased bg-charcoal text-zinc-100`}
        suppressHydrationWarning
      >
        <ToastProvider>
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-white/10 bg-charcoal/80 backdrop-blur-2xl sticky top-0 z-50">
              <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="h-7 w-7 rounded-xl bg-neon-green shadow-[0_0_20px_var(--neon-green)] group-hover:shadow-[0_0_30px_var(--neon-green)] transition-shadow" />
                  <span className="bg-gradient-to-r from-neon-green to-hot-pink bg-clip-text text-lg font-bold text-transparent">
                    Tea
                  </span>
                </Link>
                <nav className="flex items-center gap-4">
                  <Link
                    href="/kettles"
                    className="hidden sm:inline text-xs font-bold text-zinc-400 hover:text-neon-green transition-colors"
                  >
                    Browse Kettles
                  </Link>
                  <span className="hidden md:inline text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Anonymous. Chaotic. Real.
                  </span>
                </nav>
              </div>
            </header>

            <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
              {children}
            </main>

            <footer className="border-t border-white/5 bg-charcoal/60 backdrop-blur-xl py-4 text-center text-xs font-medium text-zinc-500">
              Built for the ones who always have receipts ☕
            </footer>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
