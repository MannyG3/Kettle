'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/Toast';
import { createSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient';

interface ReportButtonProps {
  postId: string;
}

const reportReasons = [
  { value: 'spam', label: '🗑️ Spam', description: 'Unwanted promotional content' },
  { value: 'harassment', label: '😠 Harassment', description: 'Targeting or bullying someone' },
  { value: 'hate_speech', label: '🚫 Hate Speech', description: 'Discriminatory language' },
  { value: 'explicit_content', label: '🔞 Explicit Content', description: 'NSFW or inappropriate content' },
  { value: 'misinformation', label: '📰 Misinformation', description: 'False or misleading info' },
  { value: 'doxxing', label: '🔍 Doxxing', description: 'Sharing private information' },
  { value: 'self_harm', label: '💔 Self Harm', description: 'Content promoting self-harm' },
  { value: 'other', label: '📋 Other', description: 'Something else' },
];

export function ReportButton({ postId }: ReportButtonProps) {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedReason(null);
    setDescription('');
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      showToast('Please select a reason', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured()) {
        const supabase = createSupabaseClient();
        
        // Get or create a fingerprint for the reporter
        let fingerprint = localStorage.getItem('tea-fingerprint');
        if (!fingerprint) {
          fingerprint = Math.random().toString(36).substring(2, 15);
          localStorage.setItem('tea-fingerprint', fingerprint);
        }

        const { error } = await supabase.from('reports').insert({
          post_id: postId,
          reporter_fingerprint: fingerprint,
          reason: selectedReason,
          description: description.trim() || null,
        });

        if (error) {
          throw error;
        }
      }

      showToast('Report submitted. Thanks for keeping Tea safe! 🙏', 'success');
      handleClose();
    } catch (error) {
      console.error('Failed to submit report:', error);
      showToast('Failed to submit report. Try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 hover:text-hot-pink"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title="Report this post"
      >
        🚩
      </motion.button>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/80 backdrop-blur-xl p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            >
              <motion.div
                className="glass-strong w-full max-w-md rounded-2xl border border-white/10 p-5"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">Report Post</h3>
                  <p className="text-xs text-zinc-500">Help keep Tea a safe space</p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-zinc-400 hover:text-zinc-100"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase text-zinc-500 mb-2">
                    Why are you reporting this?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {reportReasons.map((reason) => (
                      <button
                        key={reason.value}
                        type="button"
                        onClick={() => setSelectedReason(reason.value)}
                        className={`rounded-xl p-3 text-left transition-all ${
                          selectedReason === reason.value
                            ? 'bg-hot-pink/20 border-hot-pink/50 border'
                            : 'bg-white/5 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        <p className="text-sm font-bold text-zinc-100">{reason.label}</p>
                        <p className="text-[10px] text-zinc-500">{reason.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us more about why this post is problematic..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-hot-pink/50 focus:outline-none resize-none"
                    rows={3}
                    maxLength={500}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 rounded-xl bg-white/5 py-2.5 text-sm font-bold text-zinc-400 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!selectedReason || isSubmitting}
                    className="flex-1 rounded-xl bg-hot-pink py-2.5 text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>

                <p className="text-[10px] text-zinc-600 text-center">
                  Reports are anonymous and reviewed by our mod team.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
        document.body
      )}
    </>
  );
}
