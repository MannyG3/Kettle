'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type Settings = {
  postsPerHour: number;
  cooldownSeconds: number;
  maxPostLength: number;
  profanityFilter: boolean;
  autoHideReported: boolean;
  boilingThreshold: number;
  allowSuggestions: boolean;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    postsPerHour: 10,
    cooldownSeconds: 30,
    maxPostLength: 500,
    profanityFilter: true,
    autoHideReported: true,
    boilingThreshold: 100,
    allowSuggestions: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Admin Settings</h1>
        <p className="text-sm text-zinc-500">Configure app settings and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Rate Limiting */}
        <div className="glass-strong rounded-2xl border border-white/10 p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
            ⏱️ Rate Limiting
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-100">Posts per hour</p>
                <p className="text-xs text-zinc-500">Max posts a user can make per hour</p>
              </div>
              <input
                type="number"
                value={settings.postsPerHour}
                onChange={(e) => updateSetting('postsPerHour', parseInt(e.target.value) || 0)}
                className="w-20 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-100 text-center focus:border-neon-green/50 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-100">Cooldown between posts</p>
                <p className="text-xs text-zinc-500">Minimum seconds between posts</p>
              </div>
              <input
                type="number"
                value={settings.cooldownSeconds}
                onChange={(e) => updateSetting('cooldownSeconds', parseInt(e.target.value) || 0)}
                className="w-20 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-100 text-center focus:border-neon-green/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Content Settings */}
        <div className="glass-strong rounded-2xl border border-white/10 p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
            📝 Content Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-100">Max post length</p>
                <p className="text-xs text-zinc-500">Character limit for posts</p>
              </div>
              <input
                type="number"
                value={settings.maxPostLength}
                onChange={(e) => updateSetting('maxPostLength', parseInt(e.target.value) || 0)}
                className="w-20 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-100 text-center focus:border-neon-green/50 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-100">Profanity filter</p>
                <p className="text-xs text-zinc-500">Filter offensive words</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input 
                  type="checkbox" 
                  checked={settings.profanityFilter}
                  onChange={(e) => updateSetting('profanityFilter', e.target.checked)}
                  className="peer sr-only" 
                />
                <div className="h-6 w-11 rounded-full bg-white/10 peer-checked:bg-neon-green/50 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-100">Auto-hide reported posts</p>
                <p className="text-xs text-zinc-500">Hide posts with 3+ reports</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input 
                  type="checkbox" 
                  checked={settings.autoHideReported}
                  onChange={(e) => updateSetting('autoHideReported', e.target.checked)}
                  className="peer sr-only" 
                />
                <div className="h-6 w-11 rounded-full bg-white/10 peer-checked:bg-neon-green/50 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Kettle Settings */}
        <div className="glass-strong rounded-2xl border border-white/10 p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
            🫖 Kettle Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-100">Boiling threshold</p>
                <p className="text-xs text-zinc-500">Heat needed for kettle to boil</p>
              </div>
              <input
                type="number"
                value={settings.boilingThreshold}
                onChange={(e) => updateSetting('boilingThreshold', parseInt(e.target.value) || 0)}
                className="w-20 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-zinc-100 text-center focus:border-neon-green/50 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-100">Allow user suggestions</p>
                <p className="text-xs text-zinc-500">Let users suggest new kettles</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input 
                  type="checkbox" 
                  checked={settings.allowSuggestions}
                  onChange={(e) => updateSetting('allowSuggestions', e.target.checked)}
                  className="peer sr-only" 
                />
                <div className="h-6 w-11 rounded-full bg-white/10 peer-checked:bg-neon-green/50 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </div>
          </div>
        </div>

        <motion.button 
          onClick={handleSave}
          disabled={saving}
          className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${
            saved 
              ? 'bg-green-500 text-white' 
              : 'bg-neon-green text-charcoal hover:bg-neon-green/90'
          } disabled:opacity-50`}
          whileTap={{ scale: 0.98 }}
        >
          {saving ? 'Saving...' : saved ? '✓ Settings Saved!' : 'Save Settings'}
        </motion.button>
      </div>
    </div>
  );
}
