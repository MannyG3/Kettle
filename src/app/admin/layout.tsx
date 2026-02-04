'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  validateAdminCredentials, 
  isAdminAuthenticated, 
  setAdminAuthenticated,
  logoutAdmin 
} from '@/lib/adminAuth';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/reports', label: 'Reports', icon: '🚨' },
  { href: '/admin/posts', label: 'Posts', icon: '📝' },
  { href: '/admin/kettles', label: 'Kettles', icon: '🫖' },
  { href: '/admin/suggestions', label: 'Suggestions', icon: '💡' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/moderation', label: 'Mod Log', icon: '📋' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

function AdminLoginForm({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (validateAdminCredentials(username, password)) {
      setAdminAuthenticated(true);
      onLogin();
    } else {
      setError('Invalid username or password');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-charcoal p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="glass-strong rounded-2xl border border-white/10 p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-neon-green to-hot-pink shadow-lg mb-4" />
            <h1 className="text-2xl font-bold text-zinc-100">Tea Admin</h1>
            <p className="text-sm text-zinc-400 mt-1">Sign in to continue</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-zinc-400 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-charcoal-light px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-neon-green/50 focus:outline-none focus:ring-2 focus:ring-neon-green/20"
                placeholder="Enter username"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-zinc-400 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-charcoal-light px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-neon-green/50 focus:outline-none focus:ring-2 focus:ring-neon-green/20"
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <motion.div
                className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-neon-green px-4 py-3 text-sm font-bold text-charcoal shadow-[0_0_28px_var(--neon-green)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Back to site link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs font-medium text-zinc-500 hover:text-neon-green transition-colors"
            >
              ← Back to Tea
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    setIsAuthenticated(isAdminAuthenticated());
    setIsCheckingAuth(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
    router.push('/');
  };

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal">
        <div className="flex items-center gap-3 text-zinc-400">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AdminLoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-charcoal">
      {/* Sidebar */}
      <motion.aside
        className={`fixed left-0 top-0 z-40 h-screen bg-charcoal-light border-r border-white/10 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
        initial={false}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-neon-green to-hot-pink shadow-lg" />
              {isSidebarOpen && (
                <span className="text-lg font-bold text-zinc-100">Tea Admin</span>
              )}
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-zinc-400 hover:text-zinc-100"
            >
              {isSidebarOpen ? '◀' : '▶'}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-neon-green/20 text-neon-green'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {isSidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/10 p-4 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
            >
              <span className="text-lg">🌐</span>
              {isSidebarOpen && <span>Back to Site</span>}
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <span className="text-lg">🚪</span>
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-charcoal/80 backdrop-blur-xl px-6">
          <h1 className="text-lg font-bold text-zinc-100">
            {navItems.find((item) => item.href === pathname)?.label || 'Admin'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-zinc-500">
              Super Admin
            </span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-neon-green to-hot-pink" />
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
