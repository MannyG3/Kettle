'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { createSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';

type Kettle = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  is_active: boolean;
  post_count?: number;
  total_heat?: number;
  created_at: string;
};

// Demo data
const demoKettles: Kettle[] = [
  {
    id: '1',
    name: 'Campus Chaos',
    slug: 'campus-chaos',
    description: 'Dorm drama, roommate rants, and lecture legends.',
    icon: '🏫',
    is_active: true,
    post_count: 45,
    total_heat: 890,
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Relationship Drama',
    slug: 'relationship-drama',
    description: 'Red flags, green texts, and delulu lore.',
    icon: '💔',
    is_active: true,
    post_count: 38,
    total_heat: 654,
    created_at: '2026-01-16T10:00:00Z',
  },
  {
    id: '3',
    name: 'Main Character Energy',
    slug: 'main-character-energy',
    description: 'When you ARE the plot twist.',
    icon: '✨',
    is_active: true,
    post_count: 0,
    total_heat: 0,
    created_at: '2026-01-20T10:00:00Z',
  },
];

export default function AdminKettlesPage() {
  const [kettles, setKettles] = useState<Kettle[]>(demoKettles);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingKettle, setEditingKettle] = useState<Kettle | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '🍵',
  });

  const fetchKettles = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setKettles(demoKettles);
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from('kettles_with_heat')
        .select('*')
        .order('name');

      if (error) throw error;
      setKettles((data || []).map((k: Record<string, unknown>) => ({
        ...k,
        is_active: k.is_active ?? true,
      })) as Kettle[]);
    } catch (error) {
      console.error('Failed to fetch kettles:', error);
      setKettles(demoKettles);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKettles();
  }, [fetchKettles]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingKettle ? formData.slug : generateSlug(name),
    });
  };

  const openCreateModal = () => {
    setEditingKettle(null);
    setFormData({ name: '', slug: '', description: '', icon: '🍵' });
    setShowModal(true);
  };

  const openEditModal = (kettle: Kettle) => {
    setEditingKettle(kettle);
    setFormData({
      name: kettle.name,
      slug: kettle.slug,
      description: kettle.description,
      icon: kettle.icon,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) return;
    
    setActionLoading('save');
    try {
      if (isSupabaseConfigured()) {
        const supabase = createSupabaseClient();
        
        if (editingKettle) {
          await supabase
            .from('kettles')
            .update({
              name: formData.name,
              slug: formData.slug,
              description: formData.description,
              icon: formData.icon,
            })
            .eq('id', editingKettle.id);
        } else {
          await supabase.from('kettles').insert({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            icon: formData.icon,
          });
        }
      }
      
      // Refresh
      await fetchKettles();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save kettle:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (kettle: Kettle) => {
    setActionLoading(kettle.id);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createSupabaseClient();
        await supabase
          .from('kettles')
          .update({ is_active: !kettle.is_active })
          .eq('id', kettle.id);
      }
      setKettles(kettles.map(k => 
        k.id === kettle.id ? { ...k, is_active: !k.is_active } : k
      ));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (kettleId: string) => {
    if (!confirm('Delete this kettle and ALL its posts? This cannot be undone!')) return;
    
    setActionLoading(kettleId);
    try {
      if (isSupabaseConfigured()) {
        const supabase = createSupabaseClient();
        await supabase.from('kettles').delete().eq('id', kettleId);
      }
      setKettles(kettles.filter(k => k.id !== kettleId));
    } finally {
      setActionLoading(null);
    }
  };

  const icons = ['🍵', '☕', '🫖', '🏫', '💔', '✨', '🔥', '💀', '👻', '🎭', '💼', '🎮', '📚', '🌶️', '🤫', '😈'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Manage Kettles</h1>
          <p className="text-sm text-zinc-500">
            {kettles.length} kettles • {kettles.filter(k => k.is_active).length} active
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="rounded-xl bg-neon-green px-4 py-2 text-sm font-bold text-charcoal hover:bg-neon-green/90"
        >
          + New Kettle
        </button>
      </div>

      {/* Kettles Grid */}
      {loading ? (
        <div className="glass-strong rounded-2xl border border-white/10 p-8 text-center">
          <p className="text-zinc-500">Loading kettles...</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kettles.map((kettle) => (
            <motion.div
              key={kettle.id}
              className={`glass-strong rounded-2xl border p-5 transition-all ${
                kettle.is_active
                  ? 'border-white/10 hover:border-neon-green/30'
                  : 'border-red-500/30 opacity-60'
              }`}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{kettle.icon}</span>
                  <div>
                    <h3 className="font-bold text-zinc-100">{kettle.name}</h3>
                    <p className="text-[10px] text-zinc-500">/{kettle.slug}</p>
                  </div>
                </div>
                {!kettle.is_active && (
                  <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
                    Inactive
                  </span>
                )}
              </div>
              
              <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{kettle.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                <span>📝 {kettle.post_count || 0} posts</span>
                <span>🔥 {kettle.total_heat || 0} heat</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(kettle)}
                  className="flex-1 rounded-lg bg-white/5 py-1.5 text-xs font-medium text-zinc-400 hover:bg-white/10"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleToggleActive(kettle)}
                  disabled={actionLoading === kettle.id}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-medium ${
                    kettle.is_active
                      ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                >
                  {kettle.is_active ? '🚫 Disable' : '✅ Enable'}
                </button>
                <button
                  onClick={() => handleDelete(kettle.id)}
                  disabled={actionLoading === kettle.id}
                  className="rounded-lg bg-red-500/20 px-2 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/30"
                >
                  🗑️
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-xl p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            className="glass-strong w-full max-w-md rounded-2xl border border-white/10 p-6"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-zinc-100">
                {editingKettle ? 'Edit Kettle' : 'Create New Kettle'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`h-10 w-10 rounded-lg text-xl transition-all ${
                        formData.icon === icon
                          ? 'bg-neon-green/20 ring-2 ring-neon-green'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Campus Chaos"
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-neon-green/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">
                  Slug
                </label>
                <div className="flex items-center">
                  <span className="text-zinc-500 text-sm mr-1">/k/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="campus-chaos"
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-neon-green/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What's this kettle about?"
                  rows={2}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-neon-green/50 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl bg-white/5 py-2.5 text-sm font-bold text-zinc-400 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!formData.name || !formData.slug || actionLoading === 'save'}
                  className="flex-1 rounded-xl bg-neon-green py-2.5 text-sm font-bold text-charcoal disabled:opacity-50"
                >
                  {actionLoading === 'save' ? 'Saving...' : editingKettle ? 'Save Changes' : 'Create Kettle'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
