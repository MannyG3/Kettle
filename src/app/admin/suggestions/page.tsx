'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { createSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import { timeAgo } from '@/lib/timeAgo';

type Suggestion = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
};

// Demo data
const demoSuggestions: Suggestion[] = [
  {
    id: '1',
    name: 'Finance Failures',
    slug: 'finance-failures',
    description: 'Bad financial decisions, crypto losses, and money mistakes',
    icon: '💸',
    status: 'pending',
    rejection_reason: null,
    created_at: '2026-02-04T10:30:00Z',
  },
  {
    id: '2',
    name: 'Gaming Hot Takes',
    slug: 'gaming-hot-takes',
    description: 'Controversial gaming opinions that will start wars',
    icon: '🎮',
    status: 'pending',
    rejection_reason: null,
    created_at: '2026-02-03T14:20:00Z',
  },
  {
    id: '3',
    name: 'Celebrity Gossip',
    slug: 'celebrity-gossip',
    description: 'Hollywood drama and celeb tea',
    icon: '⭐',
    status: 'rejected',
    rejection_reason: 'Too broad, could lead to doxxing',
    created_at: '2026-02-02T09:15:00Z',
  },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400' },
  approved: { label: 'Approved', color: 'bg-green-500/20 text-green-400' },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400' },
};

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(demoSuggestions);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<Suggestion | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchSuggestions = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSuggestions(demoSuggestions);
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from('kettle_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions((data || []) as Suggestion[]);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions(demoSuggestions);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleApprove = async (suggestion: Suggestion) => {
    setActionLoading(suggestion.id);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createSupabaseClient();
        
        // Create the kettle
        await supabase.from('kettles').insert({
          name: suggestion.name,
          slug: suggestion.slug,
          description: suggestion.description,
          icon: suggestion.icon,
        });

        // Update suggestion status
        await supabase
          .from('kettle_suggestions')
          .update({ status: 'approved' })
          .eq('id', suggestion.id);
      }

      setSuggestions(suggestions.map(s =>
        s.id === suggestion.id ? { ...s, status: 'approved' } : s
      ));
    } catch (error) {
      console.error('Failed to approve suggestion:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    
    setActionLoading(rejectModal.id);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createSupabaseClient();
        await supabase
          .from('kettle_suggestions')
          .update({ 
            status: 'rejected',
            rejection_reason: rejectReason || null,
          })
          .eq('id', rejectModal.id);
      }

      setSuggestions(suggestions.map(s =>
        s.id === rejectModal.id ? { ...s, status: 'rejected', rejection_reason: rejectReason || null } : s
      ));
      setRejectModal(null);
      setRejectReason('');
    } catch (error) {
      console.error('Failed to reject suggestion:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSuggestions = filter === 'all'
    ? suggestions
    : suggestions.filter(s => s.status === filter);

  const pendingCount = suggestions.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Kettle Suggestions</h1>
          <p className="text-sm text-zinc-500">
            {pendingCount} pending suggestions to review
          </p>
        </div>
        <button
          onClick={fetchSuggestions}
          className="rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-zinc-400 hover:bg-white/10"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              filter === status
                ? 'bg-neon-green text-charcoal'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-yellow-500 px-1.5 text-[10px] text-charcoal">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Suggestions List */}
      {loading ? (
        <div className="glass-strong rounded-2xl border border-white/10 p-8 text-center">
          <p className="text-zinc-500">Loading suggestions...</p>
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="glass-strong rounded-2xl border border-white/10 p-8 text-center">
          <p className="text-zinc-500">No suggestions found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSuggestions.map((suggestion) => (
            <motion.div
              key={suggestion.id}
              className={`glass-strong rounded-2xl border p-4 ${
                suggestion.status === 'pending'
                  ? 'border-yellow-500/30'
                  : suggestion.status === 'approved'
                  ? 'border-green-500/30'
                  : 'border-red-500/30 opacity-60'
              }`}
              whileHover={{ scale: 1.002 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{suggestion.icon}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-zinc-100">{suggestion.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusLabels[suggestion.status].color}`}>
                        {statusLabels[suggestion.status].label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mb-1">/{suggestion.slug}</p>
                    <p className="text-sm text-zinc-400">{suggestion.description}</p>
                    {suggestion.rejection_reason && (
                      <p className="mt-2 text-xs text-red-400 italic">
                        Rejected: {suggestion.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[10px] text-zinc-500 mb-2">{timeAgo(suggestion.created_at)}</p>
                  
                  {suggestion.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(suggestion)}
                        disabled={actionLoading === suggestion.id}
                        className="rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-bold text-green-400 hover:bg-green-500/30 disabled:opacity-50"
                      >
                        {actionLoading === suggestion.id ? '...' : '✅ Approve'}
                      </button>
                      <button
                        onClick={() => setRejectModal(suggestion)}
                        disabled={actionLoading === suggestion.id}
                        className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/30 disabled:opacity-50"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-xl p-4"
          onClick={() => setRejectModal(null)}
        >
          <motion.div
            className="glass-strong w-full max-w-md rounded-2xl border border-white/10 p-6"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-100">Reject Suggestion</h3>
              <button
                onClick={() => setRejectModal(null)}
                className="text-zinc-400 hover:text-zinc-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-3">
                <span className="text-2xl">{rejectModal.icon}</span>
                <div>
                  <p className="font-bold text-zinc-100">{rejectModal.name}</p>
                  <p className="text-xs text-zinc-500">{rejectModal.description}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">
                  Rejection Reason (optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Why is this suggestion being rejected?"
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-red-500/50 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRejectModal(null)}
                  className="flex-1 rounded-xl bg-white/5 py-2.5 text-sm font-bold text-zinc-400 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={actionLoading === rejectModal.id}
                  className="flex-1 rounded-xl bg-red-500/80 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  {actionLoading === rejectModal.id ? 'Rejecting...' : 'Reject Suggestion'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
