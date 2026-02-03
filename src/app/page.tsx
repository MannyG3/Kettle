import Link from "next/link";

const sampleKettles = [
  {
    name: "Campus Chaos",
    slug: "campus-chaos",
    description: "Dorm drama, roommate rants, and lecture legends.",
    heat: 92,
    tag: "College",
  },
  {
    name: "Situationships",
    slug: "situationships",
    description: "Red flags, green texts, and delulu lore.",
    heat: 78,
    tag: "Spicy",
  },
  {
    name: "Workplace Whispers",
    slug: "workplace-whispers",
    description: "Boss gossip, Slack screenshots, and HR horror stories.",
    heat: 64,
    tag: "9-to-5",
  },
];

const sampleTea = [
  {
    kettle: "Campus Chaos",
    identity: "Spicy Matcha",
    title: "My professor just quoted a TikTok trend unironically",
    heat: 128,
  },
  {
    kettle: "Situationships",
    identity: "Salty Earl Grey",
    title: "He said he’s “not ready to date” then soft-launched someone else",
    heat: 203,
  },
  {
    kettle: "Workplace Whispers",
    identity: "Iced Oolong",
    title: "Manager schedules a 4:59pm Friday “quick sync” every week",
    heat: 89,
  },
];

export default function Home() {
  return (
    <div className="flex w-full flex-col gap-8 lg:flex-row lg:gap-10">
      <section className="flex-1 space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-neon-green/40 bg-neon-green-dim px-3 py-1 text-[11px] font-bold text-neon-green shadow-[0_0_20px_var(--neon-green)]">
          <span className="h-2 w-2 rounded-full bg-neon-green animate-pulse" />
          Live tea is brewing
        </div>

        <div className="space-y-4">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-zinc-50">
            Spill the{" "}
            <span className="bg-gradient-to-r from-neon-green to-hot-pink bg-clip-text text-transparent">
              tea
            </span>
            , stay anonymous.
          </h1>
          <p className="max-w-xl text-sm font-medium text-zinc-300 sm:text-base">
            Tea is a Gen Z-first anonymous social app. Drop your hottest takes
            in themed{" "}
            <span className="font-bold text-neon-green">Kettles</span>, get a
            random identity like{" "}
            <span className="font-bold text-hot-pink">Spicy Matcha</span>, and
            watch the{" "}
            <span className="font-bold text-hot-pink">Heat</span> rise as posts
            start to boil.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/k/campus-chaos"
            className="group relative inline-flex items-center gap-2 rounded-full bg-neon-green px-5 py-2.5 text-sm font-bold text-charcoal shadow-[0_0_28px_var(--neon-green)] transition hover:brightness-110"
          >
            Start brewing
            <span className="text-lg leading-none group-hover:translate-x-0.5 transition">
              →
            </span>
          </Link>
          <Link
            href="/k/situationships"
            className="inline-flex items-center gap-2 rounded-full glass border border-white/10 px-4 py-2 text-xs font-bold text-zinc-200 hover:border-hot-pink/40 hover:text-hot-pink"
          >
            View trending kettles
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-500">
          <span className="rounded-full border border-white/10 glass px-3 py-1">
            No profiles
          </span>
          <span className="rounded-full border border-white/10 glass px-3 py-1">
            Random identities per thread
          </span>
          <span className="rounded-full border border-white/10 glass px-3 py-1">
            Heat-based trending
          </span>
        </div>
      </section>

      <section className="flex-1 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {sampleKettles.map((kettle) => (
            <Link
              key={kettle.name}
              href={`/k/${kettle.slug}`}
              className="glass-strong group relative overflow-hidden rounded-2xl border border-white/10 p-4 shadow-[0_0_30px_rgba(0,0,0,0.3)] transition hover:border-neon-green/30"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-zinc-50 group-hover:text-neon-green transition-colors">
                  {kettle.name}
                </h2>
                <span className="rounded-full bg-neon-green-dim border border-neon-green/30 px-2 py-0.5 text-[10px] font-bold text-neon-green">
                  {kettle.tag}
                </span>
              </div>
              <p className="mb-3 text-xs font-medium text-zinc-400">
                {kettle.description}
              </p>
              <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
                <div className="flex items-center gap-2">
                  <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-charcoal-light">
                    <div
                      className="h-full bg-gradient-to-r from-neon-green to-hot-pink"
                      style={{ width: `${Math.min(kettle.heat, 100)}%` }}
                    />
                  </div>
                  <span className="text-neon-green">
                    {kettle.heat}
                    <span className="ms-0.5 text-[9px] uppercase text-zinc-500">
                      Heat
                    </span>
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500">
                  Boils at 100+
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="glass-strong space-y-3 rounded-2xl border border-hot-pink/30 p-4 shadow-[0_0_40px_var(--hot-pink)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-hot-pink">
              Live tea feed
            </span>
            <span className="text-[10px] font-medium text-zinc-400">
              Identities reset per thread
            </span>
          </div>
          <div className="space-y-2">
            {sampleTea.map((item) => (
              <div
                key={item.title}
                className="flex items-start justify-between gap-3 rounded-xl glass border border-white/5 px-3 py-2.5"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-charcoal-light px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                      {item.kettle}
                    </span>
                    <span className="rounded-full border border-neon-green/40 bg-neon-green-dim px-2 py-0.5 text-[10px] font-bold text-neon-green">
                      {item.identity}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-zinc-100">{item.title}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-full bg-hot-pink-dim border border-hot-pink/30 px-2 py-1 text-[10px] font-bold text-hot-pink">
                    +{item.heat} Heat
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <button className="h-5 w-5 rounded-full border border-neon-green/50 bg-neon-green-dim font-bold text-neon-green">
                      ▲
                    </button>
                    <button className="h-5 w-5 rounded-full border border-white/10 glass font-medium text-zinc-400">
                      ▼
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] font-medium text-zinc-500">
          This is a preview of the Tea experience. Next up: real Kettle
          collections, Supabase-backed threads, and server-verified anonymous
          identities.
        </p>
      </section>
    </div>
  );
}
