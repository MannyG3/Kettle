'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PourTeaModal } from "@/components/PourTeaModal";
import { VoteButtons } from "@/components/VoteButtons";
import { timeAgo } from "@/lib/timeAgo";

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
  anonymous_identity: string | null;
  parent_post_id: string | null;
  created_at: string;
  replies?: Post[];
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

function PostCard({ 
  post, 
  kettleId, 
  kettleName,
  isReply = false 
}: { 
  post: Post; 
  kettleId: string;
  kettleName: string;
  isReply?: boolean;
}) {
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const identity = post.anonymous_identity || 'Anonymous Tea';
  const replyCount = post.replies?.length ?? 0;

  return (
    <motion.article
      variants={cardMotion}
      className={`glass-strong relative overflow-hidden rounded-2xl border border-white/10 p-4 shadow-[0_0_30px_rgba(0,0,0,0.4)] ${
        isReply ? 'ml-6 border-l-2 border-l-neon-green/30' : ''
      }`}
      layout
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-neon-green/30 bg-neon-green-dim text-sm">
            ☕
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-neon-green">
              {identity}
            </span>
            <span className="text-[10px] font-medium text-zinc-500">
              {timeAgo(post.created_at)}
            </span>
          </div>
        </div>

        <VoteButtons 
          postId={post.id} 
          initialHeat={post.heat_score ?? 0}
          size="sm"
        />
      </div>

      <p className="mb-3 text-sm font-medium text-zinc-100 leading-relaxed">
        {post.content}
      </p>

      {post.image_url && (
        <motion.div
          className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-black/40"
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

      {!isReply && (
        <div className="flex items-center gap-3 border-t border-white/5 pt-3">
          <motion.button
            type="button"
            onClick={() => setShowReplyModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-neon-green/30 bg-neon-green-dim px-3 py-1.5 text-[11px] font-bold text-neon-green hover:bg-neon-green/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            💬 Reply
          </motion.button>
          
          {replyCount > 0 && (
            <motion.button
              type="button"
              onClick={() => setShowReplies(!showReplies)}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 hover:text-zinc-200"
              whileHover={{ scale: 1.02 }}
            >
              {showReplies ? '▼' : '▶'} {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </motion.button>
          )}
        </div>
      )}

      {/* Replies section */}
      <AnimatePresence>
        {showReplies && post.replies && post.replies.length > 0 && (
          <motion.div
            className="mt-3 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {post.replies.map((reply) => (
              <PostCard 
                key={reply.id} 
                post={reply} 
                kettleId={kettleId}
                kettleName={kettleName}
                isReply 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply modal */}
      <PourTeaModal
        open={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        kettleId={kettleId}
        kettleName={kettleName}
        parentPostId={post.id}
        replyingTo={identity}
      />
    </motion.article>
  );
}

export function KettleFeed({ kettle, posts }: KettleFeedProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Organize posts into threads (parent posts with their replies)
  const parentPosts = posts.filter(p => !p.parent_post_id);
  const repliesMap = new Map<string, Post[]>();
  
  posts.filter(p => p.parent_post_id).forEach(reply => {
    const parentId = reply.parent_post_id!;
    if (!repliesMap.has(parentId)) {
      repliesMap.set(parentId, []);
    }
    repliesMap.get(parentId)!.push(reply);
  });

  // Attach replies to parent posts
  const threadsWithReplies = parentPosts.map(post => ({
    ...post,
    replies: repliesMap.get(post.id) ?? []
  }));

  // Calculate total heat for the kettle
  const totalHeat = posts.reduce((sum, p) => sum + (p.heat_score ?? 0), 0);
  const isBoiling = totalHeat >= 100;

  return (
    <motion.div
      className="flex w-full flex-col gap-6 lg:flex-row lg:gap-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <section className="flex-1 space-y-4 lg:max-w-xs">
        <motion.div
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold shadow-lg ${
            isBoiling
              ? 'border-hot-pink/40 bg-hot-pink-dim text-hot-pink shadow-[0_0_20px_var(--hot-pink)]'
              : 'border-neon-green/40 bg-neon-green-dim text-neon-green shadow-[0_0_20px_var(--neon-green)]'
          }`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <span className={`h-2 w-2 rounded-full animate-pulse ${isBoiling ? 'bg-hot-pink' : 'bg-neon-green'}`} />
          {isBoiling ? '🔥 Kettle is BOILING' : 'Kettle is live'}
        </motion.div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
            {kettle.name}
          </h1>
          {kettle.description && (
            <p className="text-sm font-medium text-zinc-300">
              {kettle.description}
            </p>
          )}
        </div>

        {/* Kettle stats */}
        <div className="glass-strong rounded-xl border border-white/10 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Total Heat
            </span>
            <span className={`text-lg font-bold ${isBoiling ? 'text-hot-pink' : 'text-neon-green'}`}>
              {totalHeat}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-charcoal-light">
            <motion.div
              className={`h-full ${isBoiling ? 'bg-gradient-to-r from-hot-pink to-orange-500' : 'bg-gradient-to-r from-neon-green to-hot-pink'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(totalHeat, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="mt-1 text-[10px] font-medium text-zinc-500">
            {isBoiling ? 'This kettle is on fire! 🔥' : `${100 - totalHeat} more heat to boil`}
          </p>
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
            🔄 Refresh
          </motion.button>
        </div>

        <p className="text-[11px] font-medium text-zinc-500">
          Identities are randomized per post. Upvotes increase the Heat until
          the kettle boils at 100+.
        </p>
      </section>

      <section className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">
            Kettle Feed
          </h2>
          <span className="text-[11px] font-medium text-zinc-500">
            {parentPosts.length} {parentPosts.length === 1 ? 'post' : 'posts'}
          </span>
        </div>

        <motion.div
          className="space-y-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="wait">
            {threadsWithReplies.length === 0 ? (
              <motion.div
                key="empty"
                className="glass-strong rounded-2xl border border-dashed border-white/10 p-6 text-center"
                variants={cardMotion}
              >
                <p className="text-sm font-medium text-zinc-400 mb-2">
                  No tea here yet. Be the first to pour.
                </p>
                <motion.button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-neon-green px-4 py-2 text-xs font-bold text-charcoal"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ☕ Spill the first tea
                </motion.button>
              </motion.div>
            ) : (
              threadsWithReplies.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  kettleId={kettle.id}
                  kettleName={kettle.name}
                />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      <PourTeaModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        kettleId={kettle.id}
        kettleName={kettle.name}
      />
    </motion.div>
  );
}

