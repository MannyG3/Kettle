'use client';

import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast';

interface ShareButtonProps {
  url: string;
  className?: string;
}

export function ShareButton({ url, className = '' }: ShareButtonProps) {
  const { showToast } = useToast();

  const handleShare = async () => {
    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this tea ☕',
          url: url,
        });
        return;
      } catch {
        // User cancelled or error, fall back to clipboard
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      title="Share this post"
    >
      🔗 Share
    </motion.button>
  );
}
