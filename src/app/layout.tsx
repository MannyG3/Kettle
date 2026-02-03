import type { Metadata } from "next";
import { Archivo } from "next/font/google";
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
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-white/10 bg-charcoal/80 backdrop-blur-2xl">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-xl bg-neon-green shadow-[0_0_20px_var(--neon-green)]" />
                <span className="bg-gradient-to-r from-neon-green to-hot-pink bg-clip-text text-lg font-bold text-transparent">
                  Tea
                </span>
              </div>
              <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 sm:inline">
                Anonymous. Chaotic. Real.
              </span>
            </div>
          </header>

          <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
            {children}
          </main>

          <footer className="border-t border-white/5 bg-charcoal/60 backdrop-blur-xl py-4 text-center text-xs font-medium text-zinc-500">
            Built for the ones who always have receipts ☕
          </footer>
        </div>
      </body>
    </html>
  );
}
