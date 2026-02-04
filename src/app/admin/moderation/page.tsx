'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { createSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';
import { timeAgo } from '@/lib/timeAgo';

type ModerationAction = {
  id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  admin_name: string;
  details: Record<string, unknown> | null;
  created_at: string;
};

// Demo data
const demoActions: ModerationAction[] = [
  {
    id: '1',
    action_type: 'delete_post',
    target_type: 'post',
    target_id: 'abc123',
    admin_name: 'Super Admin',
    details: { reason: 'Spam content', post_content: 'Buy cheap watches...' },
    created_at: '2026-02-04T10:30:00Z',
  },
  {
    id: '2',
    action_type: 'hide_post',
    target_type: 'post',
    target_id: 'def456',
    admin_name: 'Super Admin',
    details: { reason: 'Under review' },
    created_at: '2026-02-04T09:15:00Z',
  },
  {
    id: '3',
    action_type: 'dismiss_report',
    target_type: 'report',
    target_id: 'ghi789',
    admin_name: 'Super Admin',
    details: { reason: 'No violation found' },
    created_at: '2026-02-03T14:20:00Z',
  },
  {
    id: '4',
    action_type: 'approve_kettle',
    target_type: 'kettle',
    target_id: 'jkl012',
    admin_name: 'Super Admin',
    details: { kettle_name: 'Finance Failures' },
    created_at: '2026-02-02T11:00:00Z',
  },
];

const actionLabels: Record<string, { label: string; icon: string; color: string }> = {
  delete_post: { label: 'Post Deleted', icon: '🗑️', color: 'text-red-400' },
  hide_post: { label: 'Post Hidden', icon: '👁️', color: 'text-yellow-400' },
  restore_post: { label: 'Post Restored', icon: '✅', color: 'text-green-400' },
  ban_fingerprint: { label: 'User Banned', icon: '🚫', color: 'text-red-500' },
  unban_fingerprint: { label: 'User Unbanned', icon: '✅', color: 'text-green-400' },
  approve_kettle: { label: 'Kettle Approved', icon: '🫖', color: 'text-neon-green' },
  reject_kettle: { label: 'Kettle Rejected', icon: '❌', color: 'text-red-400' },
  edit_kettle: { label: 'Kettle Edited', icon: '✏️', color: 'text-blue-400' },
  delete_kettle: { label: 'Kettle Deleted', icon: '🗑️', color: 'text-red-400' },
  dismiss_report: { label: 'Report Dismissed', icon: '✓', color: 'text-zinc-400' },
  action_report: { label: 'Report Actioned', icon: '⚡', color: 'text-yellow-400' },
};

export default function AdminModerationPage() {
  const [actions, setActions] = useState<ModerationAction[]>(demoActions);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchActions = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setActions(demoActions);
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from('moderation_log')
        .select(`
          id,
          action_type,
          target_type,
          target_id,
          details,
          created_at,
          admin_users (name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setActions(
        (data || []).map((a: Record<string, unknown>) => ({
          id: a.id as string,
          action_type: a.action_type as string,
          target_type: a.target_type as string,
          target_id: a.target_id as string,
          admin_name: (a.admin_users as { name: string } | null)?.name || 'System',
          details: a.details as Record<string, unknown> | null,
          created_at: a.created_at as string,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch moderation log:', error);
      setActions(demoActions);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const filteredActions = filter === 'all'
    ? actions
    : actions.filter(a => a.target_type === filter);

  const actionTypes = [...new Set(actions.map(a => a.target_type))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Moderation Log</h1>
          <p className="text-sm text-zinc-500">
            {actions.length} actions recorded
          </p>
        </div>
        <button
          onClick={fetchActions}
          className="rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-zinc-400 hover:bg-white/10"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-neon-green text-charcoal'
              : 'bg-white/5 text-zinc-400 hover:bg-white/10'
          }`}
        >
          All
        </button>
        {actionTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all capitalize ${
              filter === type
                ? 'bg-neon-green text-charcoal'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10'
            }`}
          >
            {type}s
          </button>
        ))}
      </div>

      {/* Actions List */}
      {loading ? (
        <div className="glass-strong rounded-2xl border border-white/10 p-8 text-center">
          <p className="text-zinc-500">Loading moderation log...</p>
        </div>
      ) : filteredActions.length === 0 ? (
        <div className="glass-strong rounded-2xl border border-white/10 p-8 text-center">
          <p className="text-zinc-500">No moderation actions found</p>
        </div>
      ) : (
        <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden">
          <div className="divide-y divide-white/5">
            {filteredActions.map((action, index) => {
              const actionInfo = actionLabels[action.action_type] || {
                label: action.action_type,
                icon: '📋',
                color: 'text-zinc-400',
              };
              
              return (
                <motion.div
                  key={action.id}
                  className="p-4 hover:bg-white/5 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{actionInfo.icon}</span>
                      <div>
                        <p className={`font-bold ${actionInfo.color}`}>
                          {actionInfo.label}
                        </p>
                        <p className="text-xs text-zinc-500">
                          by {action.admin_name} • {timeAgo(action.created_at)}
                        </p>
                        {action.details && (
                          <div className="mt-2 rounded-lg bg-white/5 p-2 text-xs text-zinc-400">
                            {Object.entries(action.details).map(([key, value]) => (
                              <p key={key}>
                                <span className="text-zinc-500">{key}:</span>{' '}
                                {String(value).slice(0, 100)}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-500 capitalize">
                        {action.target_type}
                      </span>
                      <p className="text-[9px] text-zinc-600 mt-1">
                        ID: {action.target_id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
