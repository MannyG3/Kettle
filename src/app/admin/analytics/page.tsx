'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { createSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';

type AnalyticsData = {
  totalPosts: number;
  totalHeat: number;
  totalKettles: number;
  postsToday: number;
  postsThisWeek: number;
  avgHeatPerPost: number;
  topKettles: { name: string; posts: number; heat: number }[];
  postsPerDay: { date: string; count: number }[];
  heatPerDay: { date: string; heat: number }[];
};

// Demo data
const demoAnalytics: AnalyticsData = {
  totalPosts: 256,
  totalHeat: 4892,
  totalKettles: 8,
  postsToday: 23,
  postsThisWeek: 89,
  avgHeatPerPost: 19.1,
  topKettles: [
    { name: 'Campus Chaos', posts: 67, heat: 1245 },
    { name: 'Relationship Drama', posts: 54, heat: 987 },
    { name: 'Tech Industry Tea', posts: 42, heat: 856 },
    { name: 'Professor Rants', posts: 38, heat: 723 },
    { name: 'Dorm Drama', posts: 31, heat: 612 },
  ],
  postsPerDay: [
    { date: '2026-01-29', count: 12 },
    { date: '2026-01-30', count: 18 },
    { date: '2026-01-31', count: 15 },
    { date: '2026-02-01', count: 22 },
    { date: '2026-02-02', count: 28 },
    { date: '2026-02-03', count: 19 },
    { date: '2026-02-04', count: 23 },
  ],
  heatPerDay: [
    { date: '2026-01-29', heat: 234 },
    { date: '2026-01-30', heat: 312 },
    { date: '2026-01-31', heat: 287 },
    { date: '2026-02-01', heat: 456 },
    { date: '2026-02-02', heat: 523 },
    { date: '2026-02-03', heat: 389 },
    { date: '2026-02-04', heat: 412 },
  ],
};

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>(demoAnalytics);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setAnalytics(demoAnalytics);
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseClient();
      const now = new Date();
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
      const today = new Date(now.setHours(0, 0, 0, 0)).toISOString();

      const [
        { count: totalPosts },
        { count: totalKettles },
        { data: kettlesData },
        { count: postsToday },
        { data: postsInPeriod },
      ] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('kettles').select('*', { count: 'exact', head: true }),
        supabase.from('kettles_with_heat').select('*').order('total_heat', { ascending: false }).limit(5),
        supabase.from('posts').select('*', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('posts').select('created_at, heat_score').gte('created_at', startDate),
      ]);

      // Calculate posts per day
      const postsByDay: Record<string, number> = {};
      const heatByDay: Record<string, number> = {};
      
      (postsInPeriod || []).forEach((p: { created_at: string; heat_score: number | null }) => {
        const date = p.created_at.split('T')[0];
        postsByDay[date] = (postsByDay[date] || 0) + 1;
        heatByDay[date] = (heatByDay[date] || 0) + (p.heat_score || 0);
      });

      const totalHeat = (kettlesData || []).reduce((sum: number, k: { total_heat: number }) => sum + (k.total_heat || 0), 0);

      setAnalytics({
        totalPosts: totalPosts || 0,
        totalHeat,
        totalKettles: totalKettles || 0,
        postsToday: postsToday || 0,
        postsThisWeek: (postsInPeriod || []).length,
        avgHeatPerPost: totalPosts ? Math.round((totalHeat / totalPosts) * 10) / 10 : 0,
        topKettles: (kettlesData || []).map((k: { name: string; post_count: number; total_heat: number }) => ({
          name: k.name,
          posts: k.post_count || 0,
          heat: k.total_heat || 0,
        })),
        postsPerDay: Object.entries(postsByDay)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-7),
        heatPerDay: Object.entries(heatByDay)
          .map(([date, heat]) => ({ date, heat }))
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-7),
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setAnalytics(demoAnalytics);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const maxPosts = Math.max(...analytics.postsPerDay.map(d => d.count), 1);
  const maxHeat = Math.max(...analytics.heatPerDay.map(d => d.heat), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Analytics</h1>
          <p className="text-sm text-zinc-500">Track engagement and growth metrics</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                period === p
                  ? 'bg-neon-green text-charcoal'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10'
              }`}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="glass-strong rounded-2xl border border-white/10 p-8 text-center">
          <p className="text-zinc-500">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard label="Total Posts" value={analytics.totalPosts} icon="📝" color="neon-green" />
            <MetricCard label="Total Heat" value={analytics.totalHeat} icon="🔥" color="hot-pink" />
            <MetricCard label="Posts Today" value={analytics.postsToday} icon="📅" color="blue" />
            <MetricCard label="Avg Heat/Post" value={analytics.avgHeatPerPost} icon="📊" color="purple" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Posts Chart */}
            <div className="glass-strong rounded-2xl border border-white/10 p-5">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
                📈 Posts per Day
              </h2>
              <div className="flex items-end gap-2 h-40">
                {analytics.postsPerDay.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      className="w-full bg-neon-green/60 rounded-t"
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.count / maxPosts) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                    <span className="text-[9px] text-zinc-500">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400">{day.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Heat Chart */}
            <div className="glass-strong rounded-2xl border border-white/10 p-5">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
                🔥 Heat per Day
              </h2>
              <div className="flex items-end gap-2 h-40">
                {analytics.heatPerDay.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      className="w-full bg-hot-pink/60 rounded-t"
                      initial={{ height: 0 }}
                      animate={{ height: `${(day.heat / maxHeat) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                    <span className="text-[9px] text-zinc-500">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400">{day.heat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Kettles */}
          <div className="glass-strong rounded-2xl border border-white/10 p-5">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
              🏆 Top Kettles by Heat
            </h2>
            <div className="space-y-3">
              {analytics.topKettles.map((kettle, index) => {
                const maxKettleHeat = Math.max(...analytics.topKettles.map(k => k.heat), 1);
                return (
                  <div key={kettle.name} className="flex items-center gap-3">
                    <span className="text-lg w-6">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-zinc-200">{kettle.name}</span>
                        <span className="text-xs text-zinc-500">{kettle.posts} posts • {kettle.heat} 🔥</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-neon-green to-hot-pink rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(kettle.heat / maxKettleHeat) * 100}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    'neon-green': 'text-neon-green',
    'hot-pink': 'text-hot-pink',
    'blue': 'text-blue-400',
    'purple': 'text-purple-400',
  };

  return (
    <div className="glass-strong rounded-2xl border border-white/10 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-xs font-medium text-zinc-500">{label}</p>
    </div>
  );
}
