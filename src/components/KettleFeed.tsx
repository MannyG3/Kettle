'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PourTeaModal } from "@/components/PourTeaModal";

type Kettle = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

type Post = {
  id: string;
  content: string;
  image_url: string | null;
  heat_score: number | null;
  created_at: string;
};

type KettleFeedProps = {
  kettle: Kettle;
  posts: Post[];
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const cardMotion = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
};

export function KettleFeed({ kettle, posts }: KettleFeedProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <motion.div
      className="flex w-full flex-col gap-6 lg:flex-row lg:gap-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <section className="flex-1 space-y-4">
        <motion.div
          className="inline-flex items-center gap-2 rounded-full border border-[var(--neon-green)]/40 bg-neon-green-dim px-3 py-1 text-[11px] font-bold text-neon-green shadow-[0_0_20px_var(--neon-green)]"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <span className="h-2 w-2 rounded-full bg-neon-green animate-pulse" />
          Kettle is live
        </motion.div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
            {kettle.name}
          </h1>
          {kettle.description && (
            <p className="max-w-xl text-sm font-medium text-zinc-300">
              {kettle.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <motion.button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="group inline-flex items-center gap-2 rounded-full bg-neon-green px-4 py-2 text-xs font-bold text-charcoal shadow-[0_0_28px_var(--neon-green)]"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Pour the Tea
            <span className="text-base leading-none group-hover:translate-x-0.5 transition-transform">
              ☕
            </span>
          </motion.button>
          <motion.button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 glass px-3 py-1.5 text-[11px] font-bold text-zinc-300 hover:border-hot-pink/40 hover:text-hot-pink"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Refresh Heat
          </motion.button>
        </div>

        <p className="text-[11px] font-medium text-zinc-500">
          Identities are randomized per thread. Upvotes increase the Heat until
          the kettle boils.
        </p>
      </section>

      <section className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">
            Kettle Feed
          </h2>
          <span className="text-[11px] font-medium text-zinc-500">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
        </div>

        <motion.div
          className="space-y-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="wait">
            {posts.length === 0 ? (
              <motion.div
                key="empty"
                className="glass-strong rounded-2xl border border-dashed border-white/10 p-4 text-center text-xs font-medium text-zinc-400"
                variants={cardMotion}
              >
                No tea here yet. Be the first to pour.
              </motion.div>
            ) : (
              posts.map((post) => (
                <motion.article
                  key={post.id}
                  variants={cardMotion}
                  className="glass-strong relative overflow-hidden rounded-2xl border border-white/10 p-4 shadow-[0_0_30px_rgba(0,0,0,0.4)]"
                  layout
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neon-green/30 bg-neon-green-dim text-xs text-neon-green">
                        ☕
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                          Anonymous Tea
                        </span>
                        <span className="text-[10px] font-medium text-zinc-500">
                          {new Date(post.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                      >
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            (post.heat_score ?? 0) >= 100
                              ? "bg-hot-pink-dim text-hot-pink shadow-[0_0_12px_var(--hot-pink)]"
                              : "bg-charcoal-light text-neon-green"
                          }`}
                        >
                          {(post.heat_score ?? 0) >= 100 ? "Boiling" : "Heat"}
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            (post.heat_score ?? 0) >= 100
                              ? "text-hot-pink"
                              : "text-neon-green"
                          }`}
                        >
                          {post.heat_score ?? 0}
                        </span>
                      </motion.div>
                      <motion.button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="rounded-full border border-neon-green/50 bg-neon-green-dim px-2 py-1 text-[10px] font-bold text-neon-green hover:bg-neon-green/20"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Add Tea
                      </motion.button>
                    </div>
                  </div>

                  <p className="mb-3 text-sm font-medium text-zinc-100">
                    {post.content}
                  </p>

                  {post.image_url && (
                    <motion.div
                      className="overflow-hidden rounded-xl border border-white/10 bg-black/40"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.image_url}
                        alt="Attached receipt"
                        className="max-h-72 w-full object-cover"
                      />
                    </motion.div>
                  )}
                </motion.article>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      <AnimatePresence>
        <PourTeaModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          kettleId={kettle.id}
          kettleName={kettle.name}
        />
      </AnimatePresence>
    </motion.div>
  );
}

