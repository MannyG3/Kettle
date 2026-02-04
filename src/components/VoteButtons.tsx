'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { createSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';

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

export function VoteButtons({ postId, initialHeat, size = 'md' }: VoteButtonsProps) {
  const [heat, setHeat] = useState(initialHeat);
  const [voteState, setVoteState] = useState<VoteState>(null);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    const stored = getStoredVotes();
    setVoteState(stored[postId] ?? null);
  }, [postId]);

  const handleVote = useCallback(async (direction: 'up' | 'down') => {
    if (!isSupabaseConfigured() || isVoting) return;

    setIsVoting(true);
    const supabase = createSupabaseClient();
    const currentVote = voteState;

    try {
      // If clicking same vote, remove it
      if (currentVote === direction) {
        // Undo the vote
        const rpcName = direction === 'up' ? 'decrement_heat' : 'increment_heat';
        const { data, error } = await supabase.rpc(rpcName, { post_id: postId });
        
        if (error) throw error;
        
        setHeat(data ?? heat);
        setVoteState(null);
        setStoredVote(postId, null);
      } else {
        // New vote or changing vote
        let newHeat = heat;

        // If changing vote, first undo the previous
        if (currentVote !== null) {
          const undoRpc = currentVote === 'up' ? 'decrement_heat' : 'increment_heat';
          const { data } = await supabase.rpc(undoRpc, { post_id: postId });
          newHeat = data ?? newHeat;
        }

        // Apply new vote
        const rpcName = direction === 'up' ? 'increment_heat' : 'decrement_heat';
        const { data, error } = await supabase.rpc(rpcName, { post_id: postId });
        
        if (error) throw error;
        
        setHeat(data ?? newHeat);
        setVoteState(direction);
        setStoredVote(postId, direction);
      }
    } catch (err) {
      console.error('Vote failed:', err);
    } finally {
      setIsVoting(false);
    }
  }, [postId, heat, voteState, isVoting]);

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
          disabled={isVoting}
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
          disabled={isVoting}
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
