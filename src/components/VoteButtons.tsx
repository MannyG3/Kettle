'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { motion } from 'framer-motion';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

type VoteButtonsProps = {
  postId: string;
  initialHeat: number;
  size?: 'sm' | 'md';
};

type VoteState = 'up' | 'down' | null;

const VOTE_STORAGE_KEY = 'tea_votes';

function getStoredVotes(): Record<string, VoteState> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(VOTE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setStoredVote(postId: string, vote: VoteState) {
  if (typeof window === 'undefined') return;
  try {
    const votes = getStoredVotes();
    if (vote === null) {
      delete votes[postId];
    } else {
      votes[postId] = vote;
    }
    localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(votes));
  } catch {
    // localStorage not available
  }
}

// Optimized vote function using Edge API
async function submitVote(postId: string, action: 'up' | 'down' | 'remove-up' | 'remove-down'): Promise<number | null> {
  try {
    const response = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action }),
    });
    
    if (!response.ok) {
      throw new Error('Vote failed');
    }
    
    const data = await response.json();
    return data.heat ?? null;
  } catch (error) {
    console.error('Vote error:', error);
    return null;
  }
}

export function VoteButtons({ postId, initialHeat, size = 'md' }: VoteButtonsProps) {
  const [heat, setHeat] = useState(initialHeat);
  const [voteState, setVoteState] = useState<VoteState>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const stored = getStoredVotes();
    setVoteState(stored[postId] ?? null);
  }, [postId]);

  const handleVote = useCallback((direction: 'up' | 'down') => {
    if (!isSupabaseConfigured() || isPending) return;

    const currentVote = voteState;
    
    // Optimistic update
    let optimisticHeat = heat;
    let newVoteState: VoteState = direction;
    let action: 'up' | 'down' | 'remove-up' | 'remove-down';
    
    if (currentVote === direction) {
      // Removing vote
      action = direction === 'up' ? 'remove-up' : 'remove-down';
      optimisticHeat = direction === 'up' ? heat - 1 : heat + 1;
      newVoteState = null;
    } else if (currentVote !== null) {
      // Changing vote
      action = direction;
      optimisticHeat = direction === 'up' ? heat + 2 : heat - 2;
    } else {
      // New vote
      action = direction;
      optimisticHeat = direction === 'up' ? heat + 1 : heat - 1;
    }
    
    // Apply optimistic update immediately
    setHeat(Math.max(0, optimisticHeat));
    setVoteState(newVoteState);
    setStoredVote(postId, newVoteState);
    
    // Submit to Edge API in background
    startTransition(async () => {
      const serverHeat = await submitVote(postId, action);
      if (serverHeat !== null) {
        setHeat(serverHeat);
      }
    });
  }, [postId, heat, voteState, isPending]);

  const isBoiling = heat >= 100;
  const sizeClasses = size === 'sm' 
    ? 'h-6 w-6 text-xs' 
    : 'h-7 w-7 text-sm';

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center gap-1">
        <motion.button
          type="button"
          onClick={() => handleVote('up')}
          disabled={isPending}
          className={`${sizeClasses} rounded-full font-bold transition-all disabled:opacity-50 ${
            voteState === 'up'
              ? 'bg-neon-green text-charcoal shadow-[0_0_12px_var(--neon-green)]'
              : 'border border-neon-green/50 bg-neon-green-dim text-neon-green hover:bg-neon-green/30'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Upvote"
        >
          ▲
        </motion.button>
        <motion.button
          type="button"
          onClick={() => handleVote('down')}
          disabled={isPending}
          className={`${sizeClasses} rounded-full font-bold transition-all disabled:opacity-50 ${
            voteState === 'down'
              ? 'bg-hot-pink text-white shadow-[0_0_12px_var(--hot-pink)]'
              : 'border border-white/10 glass text-zinc-400 hover:border-hot-pink/40 hover:text-hot-pink'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Downvote"
        >
          ▼
        </motion.button>
      </div>
      <motion.div
        className="flex flex-col items-start"
        key={heat}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <span
          className={`text-lg font-bold ${
            isBoiling ? 'text-hot-pink' : 'text-neon-green'
          }`}
        >
          {heat}
        </span>
        <span
          className={`text-[9px] font-bold uppercase ${
            isBoiling
              ? 'text-hot-pink'
              : 'text-zinc-500'
          }`}
        >
          {isBoiling ? '🔥 Boiling' : 'Heat'}
        </span>
      </motion.div>
    </div>
  );
}
