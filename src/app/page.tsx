import Link from "next/link";
import {
  createSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabaseClient";
import { timeAgo } from "@/lib/timeAgo";

type KettleWithHeat = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  total_heat: number;
  post_count: number;
};

type TrendingPost = {
  id: string;
  content: string;
  heat_score: number;
  anonymous_identity: string;
  created_at: string;
  kettle_name: string;
  kettle_slug: string;
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
  },
  {
    id: "2",
    name: "Situationships",
    slug: "situationships",
    description: "Red flags, green texts, and delulu lore.",
    total_heat: 78,
    post_count: 23,
  },
  {
    id: "3",
    name: "Workplace Whispers",
    slug: "workplace-whispers",
    description: "Boss gossip, Slack screenshots, and HR horror stories.",
    total_heat: 64,
    post_count: 8,
  },
];

const fallbackPosts: TrendingPost[] = [
  {
    id: "1",
    kettle_name: "Campus Chaos",
    kettle_slug: "campus-chaos",
    anonymous_identity: "Spicy Matcha",
    content: "My professor just quoted a TikTok trend unironically",
    heat_score: 128,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "2",
    kettle_name: "Situationships",
    kettle_slug: "situationships",
    anonymous_identity: "Salty Earl Grey",
    content: "He said he's \"not ready to date\" then soft-launched someone else",
    heat_score: 203,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "3",
    kettle_name: "Workplace Whispers",
    kettle_slug: "workplace-whispers",
    anonymous_identity: "Iced Oolong",
    content: "Manager schedules a 4:59pm Friday \"quick sync\" every week",
    heat_score: 89,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

async function getHomeData(): Promise<{
  kettles: KettleWithHeat[];
  trendingPosts: TrendingPost[];
  isLive: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return {
      kettles: fallbackKettles,
      trendingPosts: fallbackPosts,
      isLive: false,
    };
  }

  try {
    const supabase = createSupabaseClient();

    // Fetch kettles with aggregated heat
    const { data: kettlesData } = await supabase
      .from("kettles_with_heat")
      .select("*")
      .order("total_heat", { ascending: false })
      .limit(6);

    // Fetch trending posts
    const { data: postsData } = await supabase
      .from("trending_posts")
      .select("*")
      .limit(5);

    const kettles: KettleWithHeat[] = (kettlesData ?? []).map((k) => ({
      id: k.id,
      name: k.name,
      slug: k.slug,
      description: k.description,
      total_heat: k.total_heat ?? 0,
      post_count: k.post_count ?? 0,
    }));

    const trendingPosts: TrendingPost[] = (postsData ?? []).map((p) => ({
      id: p.id,
      content: p.content,
      heat_score: p.heat_score ?? 0,
      anonymous_identity: p.anonymous_identity ?? "Anonymous Tea",
      created_at: p.created_at,
      kettle_name: p.kettle_name,
      kettle_slug: p.kettle_slug,
    }));

    return {
      kettles: kettles.length > 0 ? kettles : fallbackKettles,
      trendingPosts: trendingPosts.length > 0 ? trendingPosts : fallbackPosts,
      isLive: kettles.length > 0 || trendingPosts.length > 0,
    };
  } catch (error) {
    console.error("Failed to fetch home data:", error);
    return {
      kettles: fallbackKettles,
      trendingPosts: fallbackPosts,
      isLive: false,
    };
  }
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const { kettles, trendingPosts, isLive } = await getHomeData();

  return (
    <div className="flex w-full flex-col gap-8 lg:flex-row lg:gap-10">
      <section className="flex-1 space-y-6">
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold shadow-lg ${
          isLive
            ? 'border-neon-green/40 bg-neon-green-dim text-neon-green shadow-[0_0_20px_var(--neon-green)]'
            : 'border-zinc-600 bg-zinc-800/50 text-zinc-400'
        }`}>
          <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-neon-green animate-pulse' : 'bg-zinc-500'}`} />
          {isLive ? 'Live tea is brewing' : 'Demo mode — Configure Supabase'}
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
            href="/kettles"
            className="group relative inline-flex items-center gap-2 rounded-full bg-neon-green px-5 py-2.5 text-sm font-bold text-charcoal shadow-[0_0_28px_var(--neon-green)] transition hover:brightness-110"
          >
            Start brewing
            <span className="text-lg leading-none group-hover:translate-x-0.5 transition">
              →
            </span>
          </Link>
          <Link
            href="/kettles"
            className="inline-flex items-center gap-2 rounded-full glass border border-white/10 px-4 py-2 text-xs font-bold text-zinc-200 hover:border-hot-pink/40 hover:text-hot-pink"
          >
            View all kettles
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
        {/* Kettles Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">
              🔥 Hot Kettles
            </h2>
            <Link
              href="/kettles"
              className="text-[11px] font-bold text-neon-green hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {kettles.slice(0, 4).map((kettle) => {
              const isBoiling = kettle.total_heat >= 100;
              return (
                <Link
                  key={kettle.id}
                  href={`/k/${kettle.slug}`}
                  className="glass-strong group relative overflow-hidden rounded-2xl border border-white/10 p-4 shadow-[0_0_30px_rgba(0,0,0,0.3)] transition hover:border-neon-green/30"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-zinc-50 group-hover:text-neon-green transition-colors">
                      {kettle.name}
                    </h3>
                    {isBoiling && (
                      <span className="rounded-full bg-hot-pink-dim border border-hot-pink/30 px-2 py-0.5 text-[10px] font-bold text-hot-pink">
                        🔥 Boiling
                      </span>
                    )}
                  </div>
                  <p className="mb-3 text-xs font-medium text-zinc-400 line-clamp-2">
                    {kettle.description}
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
                    <div className="flex items-center gap-2">
                      <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-charcoal-light">
                        <div
                          className={`h-full ${isBoiling ? 'bg-gradient-to-r from-hot-pink to-orange-500' : 'bg-gradient-to-r from-neon-green to-hot-pink'}`}
                          style={{ width: `${Math.min(kettle.total_heat, 100)}%` }}
                        />
                      </div>
                      <span className={isBoiling ? 'text-hot-pink' : 'text-neon-green'}>
                        {kettle.total_heat}
                        <span className="ms-0.5 text-[9px] uppercase text-zinc-500">
                          Heat
                        </span>
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {kettle.post_count} posts
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Live Feed */}
        <div className="glass-strong space-y-3 rounded-2xl border border-hot-pink/30 p-4 shadow-[0_0_40px_var(--hot-pink)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-hot-pink">
              ☕ Trending Tea
            </span>
            <span className="text-[10px] font-medium text-zinc-400">
              Sorted by heat
            </span>
          </div>
          <div className="space-y-2">
            {trendingPosts.map((post) => {
              const isBoiling = post.heat_score >= 100;
              return (
                <Link
                  key={post.id}
                  href={`/k/${post.kettle_slug}`}
                  className="flex items-start justify-between gap-3 rounded-xl glass border border-white/5 px-3 py-2.5 hover:border-neon-green/20 transition-colors"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-charcoal-light px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                        {post.kettle_name}
                      </span>
                      <span className="rounded-full border border-neon-green/40 bg-neon-green-dim px-2 py-0.5 text-[10px] font-bold text-neon-green">
                        {post.anonymous_identity}
                      </span>
                      <span className="text-[9px] text-zinc-500">
                        {timeAgo(post.created_at)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-zinc-100 line-clamp-2">
                      {post.content}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                      isBoiling
                        ? 'bg-hot-pink-dim border border-hot-pink/30 text-hot-pink'
                        : 'bg-neon-green-dim border border-neon-green/30 text-neon-green'
                    }`}>
                      {isBoiling ? '🔥' : '+'}{post.heat_score} Heat
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {!isLive && (
          <p className="text-[11px] font-medium text-zinc-500">
            This is a preview with sample data. Add Supabase credentials to see live tea.
          </p>
        )}
      </section>
    </div>
  );
}
