import Link from "next/link";
import { Metadata } from "next";
import {
  createSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabaseClient";
import { timeAgo } from "@/lib/timeAgo";

export const metadata: Metadata = {
  title: "All Kettles — Tea",
  description: "Browse all kettles and find where the tea is hottest.",
};

export const dynamic = "force-dynamic";

type KettleWithHeat = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  total_heat: number;
  post_count: number;
  last_activity: string | null;
};

// Fallback data when Supabase is not configured
const fallbackKettles: KettleWithHeat[] = [
  {
    id: "1",
    name: "Campus Chaos",
    slug: "campus-chaos",
    description: "Dorm drama, roommate rants, and lecture legends.",
    total_heat: 92,
    post_count: 15,
    last_activity: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "2",
    name: "Situationships",
    slug: "situationships",
    description: "Red flags, green texts, and delulu lore.",
    total_heat: 178,
    post_count: 23,
    last_activity: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "3",
    name: "Workplace Whispers",
    slug: "workplace-whispers",
    description: "Boss gossip, Slack screenshots, and HR horror stories.",
    total_heat: 64,
    post_count: 8,
    last_activity: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "4",
    name: "Main Character Energy",
    slug: "main-character",
    description: "When you ARE the plot twist.",
    total_heat: 45,
    post_count: 12,
    last_activity: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "5",
    name: "Tech Tea",
    slug: "tech-tea",
    description: "Startup drama, code drama, and interview horror stories.",
    total_heat: 112,
    post_count: 19,
    last_activity: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

async function getKettles(): Promise<{
  kettles: KettleWithHeat[];
  isLive: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return {
      kettles: fallbackKettles,
      isLive: false,
    };
  }

  try {
    const supabase = createSupabaseClient();

    const { data: kettlesData } = await supabase
      .from("kettles_with_heat")
      .select("*")
      .order("total_heat", { ascending: false });

    const kettles: KettleWithHeat[] = (kettlesData ?? []).map((k) => ({
      id: k.id,
      name: k.name,
      slug: k.slug,
      description: k.description,
      total_heat: k.total_heat ?? 0,
      post_count: k.post_count ?? 0,
      last_activity: k.last_activity,
    }));

    return {
      kettles: kettles.length > 0 ? kettles : fallbackKettles,
      isLive: kettles.length > 0,
    };
  } catch (error) {
    console.error("Failed to fetch kettles:", error);
    return {
      kettles: fallbackKettles,
      isLive: false,
    };
  }
}

export default async function KettlesPage() {
  const { kettles, isLive } = await getKettles();

  // Sort kettles: boiling first, then by heat
  const sortedKettles = [...kettles].sort((a, b) => {
    const aBoiling = a.total_heat >= 100;
    const bBoiling = b.total_heat >= 100;
    if (aBoiling && !bBoiling) return -1;
    if (!aBoiling && bBoiling) return 1;
    return b.total_heat - a.total_heat;
  });

  const boilingCount = kettles.filter((k) => k.total_heat >= 100).length;

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-bold text-zinc-500 hover:text-neon-green transition-colors"
            >
              ← Home
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
            All Kettles
          </h1>
          <p className="text-sm font-medium text-zinc-400">
            {kettles.length} kettles • {boilingCount} boiling right now
          </p>
        </div>

        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold ${
          isLive
            ? 'border-neon-green/40 bg-neon-green-dim text-neon-green shadow-[0_0_16px_var(--neon-green)]'
            : 'border-zinc-600 bg-zinc-800/50 text-zinc-400'
        }`}>
          <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-neon-green animate-pulse' : 'bg-zinc-500'}`} />
          {isLive ? 'Live data' : 'Demo mode'}
        </div>
      </div>

      {/* Stats bar */}
      <div className="glass-strong flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 p-4">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-neon-green">{kettles.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Kettles</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-bold text-hot-pink">{boilingCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Boiling</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-bold text-zinc-100">
              {kettles.reduce((sum, k) => sum + k.post_count, 0)}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Posts</p>
          </div>
        </div>
        <p className="text-[11px] font-medium text-zinc-500">
          🔥 Kettles boil at 100+ heat
        </p>
      </div>

      {/* Kettles Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedKettles.map((kettle) => {
          const isBoiling = kettle.total_heat >= 100;
          return (
            <Link
              key={kettle.id}
              href={`/k/${kettle.slug}`}
              className={`glass-strong group relative overflow-hidden rounded-2xl border p-5 shadow-lg transition-all hover:scale-[1.02] ${
                isBoiling
                  ? 'border-hot-pink/40 shadow-[0_0_30px_var(--hot-pink)]'
                  : 'border-white/10 hover:border-neon-green/30'
              }`}
            >
              {/* Boiling badge */}
              {isBoiling && (
                <div className="absolute right-3 top-3">
                  <span className="rounded-full bg-hot-pink-dim border border-hot-pink/30 px-2 py-1 text-[10px] font-bold text-hot-pink animate-pulse">
                    🔥 BOILING
                  </span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <h2 className={`text-lg font-bold transition-colors ${
                    isBoiling
                      ? 'text-hot-pink group-hover:text-hot-pink'
                      : 'text-zinc-50 group-hover:text-neon-green'
                  }`}>
                    {kettle.name}
                  </h2>
                  <p className="mt-1 text-xs font-medium text-zinc-400 line-clamp-2">
                    {kettle.description}
                  </p>
                </div>

                {/* Heat bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className={isBoiling ? 'text-hot-pink' : 'text-neon-green'}>
                      {kettle.total_heat} Heat
                    </span>
                    <span className="text-zinc-500">
                      {Math.min(kettle.total_heat, 100)}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-charcoal-light">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isBoiling
                          ? 'bg-gradient-to-r from-hot-pink via-orange-500 to-yellow-500 animate-pulse'
                          : 'bg-gradient-to-r from-neon-green to-hot-pink'
                      }`}
                      style={{ width: `${Math.min(kettle.total_heat, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="flex items-center gap-3 text-[11px] font-medium text-zinc-500">
                    <span>📝 {kettle.post_count} posts</span>
                  </div>
                  {kettle.last_activity && (
                    <span className="text-[10px] font-medium text-zinc-500">
                      Active {timeAgo(kettle.last_activity)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty state */}
      {kettles.length === 0 && (
        <div className="glass-strong rounded-2xl border border-dashed border-white/10 p-12 text-center">
          <p className="text-sm font-medium text-zinc-400 mb-4">
            No kettles found. Check back later!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-neon-green px-4 py-2 text-xs font-bold text-charcoal"
          >
            ← Back to home
          </Link>
        </div>
      )}

      {!isLive && (
        <p className="text-center text-[11px] font-medium text-zinc-500">
          This is demo data. Configure Supabase to see live kettles.
        </p>
      )}
    </div>
  );
}
