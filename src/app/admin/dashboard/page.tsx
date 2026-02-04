import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";

// Demo data for when Supabase isn't configured
const demoStats = {
  totalPosts: 156,
  totalKettles: 8,
  totalHeat: 2847,
  pendingReports: 5,
  postsToday: 23,
  activeKettles: 6,
  topKettles: [
    { name: 'Campus Chaos', posts: 45, heat: 890 },
    { name: 'Dorm Drama', posts: 38, heat: 654 },
    { name: 'Professor Rants', posts: 29, heat: 523 },
  ],
  recentActivity: [
    { action: 'New post in Campus Chaos', time: '2 min ago' },
    { action: 'Report submitted', time: '5 min ago' },
    { action: 'Post reached 50 heat', time: '12 min ago' },
  ],
};

async function getStats() {
  if (!isSupabaseConfigured()) {
    return demoStats;
  }

  const supabase = createSupabaseClient();

  const [
    { count: totalPosts },
    { count: totalKettles },
    { data: kettlesWithHeat },
    { count: postsToday },
    { count: pendingReports },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('kettles').select('*', { count: 'exact', head: true }),
    supabase.from('kettles_with_heat').select('*').order('total_heat', { ascending: false }).limit(5),
    supabase.from('posts').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  const totalHeat = kettlesWithHeat?.reduce((sum, k) => sum + (k.total_heat || 0), 0) || 0;

  return {
    totalPosts: totalPosts || 0,
    totalKettles: totalKettles || 0,
    totalHeat,
    pendingReports: pendingReports || 0,
    postsToday: postsToday || 0,
    activeKettles: kettlesWithHeat?.filter(k => (k.post_count || 0) > 0).length || 0,
    topKettles: kettlesWithHeat?.slice(0, 3).map(k => ({
      name: k.name,
      posts: k.post_count || 0,
      heat: k.total_heat || 0,
    })) || [],
    recentActivity: [],
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Posts"
          value={stats.totalPosts}
          icon="📝"
          color="neon-green"
        />
        <StatCard
          label="Total Kettles"
          value={stats.totalKettles}
          icon="🫖"
          color="hot-pink"
        />
        <StatCard
          label="Total Heat"
          value={stats.totalHeat}
          icon="🔥"
          color="orange"
        />
        <StatCard
          label="Pending Reports"
          value={stats.pendingReports}
          icon="🚨"
          color="red"
          alert={stats.pendingReports > 0}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Posts Today"
          value={stats.postsToday}
          icon="📅"
          color="blue"
          size="sm"
        />
        <StatCard
          label="Active Kettles"
          value={stats.activeKettles}
          icon="♨️"
          color="purple"
          size="sm"
        />
        <StatCard
          label="Boiling Kettles"
          value={stats.topKettles.filter(k => k.heat >= 100).length}
          icon="🔥"
          color="hot-pink"
          size="sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Kettles */}
        <div className="glass-strong rounded-2xl border border-white/10 p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
            🏆 Top Kettles by Heat
          </h2>
          <div className="space-y-3">
            {stats.topKettles.map((kettle, index) => (
              <div
                key={kettle.name}
                className="flex items-center justify-between rounded-xl bg-white/5 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <div>
                    <p className="font-bold text-zinc-100">{kettle.name}</p>
                    <p className="text-xs text-zinc-500">{kettle.posts} posts</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-hot-pink">{kettle.heat}</p>
                  <p className="text-xs text-zinc-500">heat</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-strong rounded-2xl border border-white/10 p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
            ⚡ Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction href="/admin/reports" icon="🚨" label="Review Reports" />
            <QuickAction href="/admin/posts" icon="📝" label="Manage Posts" />
            <QuickAction href="/admin/kettles" icon="🫖" label="Edit Kettles" />
            <QuickAction href="/admin/suggestions" icon="💡" label="View Suggestions" />
            <QuickAction href="/admin/analytics" icon="📈" label="View Analytics" />
            <QuickAction href="/admin/settings" icon="⚙️" label="Settings" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-strong rounded-2xl border border-white/10 p-5">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
          📋 Recent Activity
        </h2>
        {stats.recentActivity.length > 0 ? (
          <div className="space-y-2">
            {stats.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
              >
                <span className="text-sm text-zinc-300">{activity.action}</span>
                <span className="text-xs text-zinc-500">{activity.time}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No recent activity to display.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  alert = false,
  size = 'md',
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
  alert?: boolean;
  size?: 'sm' | 'md';
}) {
  const colorClasses: Record<string, string> = {
    'neon-green': 'text-neon-green',
    'hot-pink': 'text-hot-pink',
    'orange': 'text-orange-400',
    'red': 'text-red-400',
    'blue': 'text-blue-400',
    'purple': 'text-purple-400',
  };

  return (
    <div
      className={`glass-strong rounded-2xl border p-4 ${
        alert ? 'border-red-500/50 animate-pulse' : 'border-white/10'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={size === 'sm' ? 'text-xl' : 'text-2xl'}>{icon}</span>
        {alert && <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />}
      </div>
      <p className={`mt-2 font-bold ${colorClasses[color]} ${size === 'sm' ? 'text-xl' : 'text-3xl'}`}>
        {value.toLocaleString()}
      </p>
      <p className="text-xs font-medium text-zinc-500">{label}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 rounded-xl bg-white/5 p-3 text-sm font-medium text-zinc-300 transition-all hover:bg-white/10 hover:text-zinc-100"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </a>
  );
}
