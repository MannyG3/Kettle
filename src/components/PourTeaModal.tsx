'use client';

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { generateRandomTeaName } from "@/lib/randomTeaName";

type PourTeaModalProps = {
  open: boolean;
  onClose: () => void;
  kettleId: string;
  kettleName: string;
};

export function PourTeaModal({
  open,
  onClose,
  kettleId,
  kettleName,
}: PourTeaModalProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError("Spill at least a little tea first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createSupabaseClient();

      let imageUrl: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `posts/${kettleId}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(path, file);

        if (uploadError) {
          console.error(uploadError);
          setError("Could not upload your image. Try again without it?");
          setIsSubmitting(false);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("post-images").getPublicUrl(path);

        imageUrl = publicUrl;
      }

      const { error: insertError } = await supabase.from("posts").insert({
        kettle_id: kettleId,
        content: content.trim(),
        image_url: imageUrl,
        heat_score: 0,
      });

      if (insertError) {
        console.error(insertError);
        setError(
          insertError.message ||
            "Something went wrong while pouring the tea."
        );
        setIsSubmitting(false);
        return;
      }

      setContent("");
      setFile(null);
      onClose();
      router.refresh();
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Unexpected error. Try again in a sec.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-charcoal/80 backdrop-blur-xl p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="glass-strong relative w-full max-w-md rounded-2xl border border-neon-green/30 p-5 shadow-[0_0_50px_var(--neon-green)]"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full glass px-2 py-1 text-xs font-bold text-zinc-400 hover:text-zinc-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ✕
            </motion.button>

            <div className="mb-3 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-neon-green">
                Pour the Tea
              </p>
              <h2 className="text-sm font-bold text-zinc-50">
                New drop in{" "}
                <span className="text-neon-green">{kettleName}</span>
              </h2>
              <p className="text-xs font-medium text-zinc-400">
                Your identity will appear as something like{" "}
                <span className="font-bold text-neon-green">
                  {generateRandomTeaName()}
                </span>{" "}
                inside the thread.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">
                  What&apos;s the tea?
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-white/10 glass p-3 text-sm font-medium text-zinc-100 outline-none transition focus:border-neon-green/50 focus:ring-2 focus:ring-neon-green/30"
                  placeholder='"My roommate just…"'
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300">
                  Add a receipt (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-xs text-zinc-400 file:mr-3 file:rounded-full file:border-0 file:bg-neon-green/20 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-neon-green hover:file:bg-neon-green/30"
                />
                <p className="text-[10px] font-medium text-zinc-500">
                  We recommend censoring names/handles before uploading.
                </p>
              </div>

              {error && (
                <motion.p
                  className="text-xs font-bold text-hot-pink"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}

              <div className="flex items-center justify-between pt-1">
                <p className="text-[10px] font-medium text-zinc-500">
                  Posts are anonymous but still need to follow basic decency.
                </p>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-neon-green px-4 py-1.5 text-xs font-bold text-charcoal shadow-[0_0_24px_var(--neon-green)] disabled:cursor-not-allowed disabled:opacity-70"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? "Pouring..." : "Pour the Tea"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

