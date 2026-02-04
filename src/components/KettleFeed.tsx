'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PourTeaModal } from "@/components/PourTeaModal";
import { VoteButtons } from "@/components/VoteButtons";
import { ShareButton } from "@/components/ShareButton";
import { timeAgo } from "@/lib/timeAgo";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";

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

// Recursively build nested replies tree
function buildReplyTree(posts: Post[]): Post[] {
  const postMap = new Map<string, Post>();
  const rootPosts: Post[] = [];

  // First pass: create all posts with empty replies arrays
  posts.forEach(post => {
    postMap.set(post.id, { ...post, replies: [] });
  });

  // Second pass: attach replies to their parents
  posts.forEach(post => {
    const postWithReplies = postMap.get(post.id)!;
    if (post.parent_post_id) {
      const parent = postMap.get(post.parent_post_id);
      if (parent) {
        parent.replies!.push(postWithReplies);
      }
    } else {
      rootPosts.push(postWithReplies);
    }
  });

  // Sort replies by created_at (oldest first for conversation flow)
  const sortReplies = (post: Post): Post => {
    if (post.replies && post.replies.length > 0) {
      post.replies.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      post.replies.forEach(sortReplies);
    }
    return post;
  };

  rootPosts.forEach(sortReplies);

  return rootPosts;
}

// Count all nested replies
function countAllReplies(post: Post): number {
  let count = post.replies?.length ?? 0;
  post.replies?.forEach(reply => {
    count += countAllReplies(reply);
  });
  return count;
}

function PostCard({ 
  post, 
  kettleId, 
  kettleName,
  depth = 0,
  onNewReply
}: { 
  post: Post; 
  kettleId: string;
  kettleName: string;
  depth?: number;
  onNewReply?: () => void;
}) {
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels
  const identity = post.anonymous_identity || 'Anonymous Tea';
  const directReplyCount = post.replies?.length ?? 0;
  const totalReplyCount = countAllReplies(post);
  const isNested = depth > 0;
  const maxDepth = 5; // Max nesting level for UI

  const handleReplySuccess = () => {
    setShowReplyModal(false);
    setIsExpanded(true);
    onNewReply?.();
  };

  return (
    <motion.article
      variants={cardMotion}
      className={`glass-strong relative overflow-hidden rounded-2xl border p-4 shadow-[0_0_30px_rgba(0,0,0,0.4)] ${
        isNested 
          ? 'border-l-2 border-l-neon-green/40 border-white/5' 
          : 'border-white/10'
      }`}
      style={{ marginLeft: isNested ? Math.min(depth * 16, 48) : 0 }}
      layout
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center rounded-full border bg-neon-green-dim text-sm ${
            isNested ? 'h-7 w-7 border-neon-green/20' : 'h-9 w-9 border-neon-green/30'
          }`}>
            {isNested ? '💬' : '☕'}
          </div>
          <div className="flex flex-col">
            <span className={`font-bold text-neon-green ${isNested ? 'text-[11px]' : 'text-xs'}`}>
              {identity}
            </span>
            <span className="text-[10px] font-medium text-zinc-500">
              {timeAgo(post.created_at)}
              {isNested && <span className="ml-1 text-zinc-600">• reply</span>}
            </span>
          </div>
        </div>

        {/* Heat voting on ALL posts including replies */}
        <VoteButtons 
          postId={post.id} 
          initialHeat={post.heat_score ?? 0}
          size="sm"
        />
      </div>

      <p className={`mb-3 font-medium text-zinc-100 leading-relaxed ${isNested ? 'text-[13px]' : 'text-sm'}`}>
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

      {/* Reply actions - available on all posts up to maxDepth */}
      <div className="flex items-center gap-3 border-t border-white/5 pt-3">
        {depth < maxDepth && (
          <motion.button
            type="button"
            onClick={() => setShowReplyModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-neon-green/30 bg-neon-green-dim px-3 py-1.5 text-[11px] font-bold text-neon-green hover:bg-neon-green/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            💬 Reply
          </motion.button>
        )}
        
        {directReplyCount > 0 && (
          <motion.button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 hover:text-zinc-200"
            whileHover={{ scale: 1.02 }}
          >
            <span className="transition-transform duration-200" style={{ 
              display: 'inline-block',
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
            }}>
              ▶
            </span>
            {totalReplyCount} {totalReplyCount === 1 ? 'reply' : 'replies'}
          </motion.button>
        )}

        {/* Share button */}
        <ShareButton 
          url={`${typeof window !== 'undefined' ? window.location.origin : ''}/k/${kettleName.toLowerCase().replace(/\s+/g, '-')}#post-${post.id}`}
        />
      </div>

      {/* Nested Replies - Always visible when expanded */}
      <AnimatePresence>
        {isExpanded && post.replies && post.replies.length > 0 && (
          <motion.div
            className="mt-3 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {post.replies.map((reply) => (
              <PostCard 
                key={reply.id} 
                post={reply} 
                kettleId={kettleId}
                kettleName={kettleName}
                depth={depth + 1}
                onNewReply={onNewReply}
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
        onSuccess={handleReplySuccess}
      />
    </motion.article>
  );
}

export function KettleFeed({ kettle, posts: initialPosts }: KettleFeedProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState(initialPosts);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Build the nested reply tree
  const threadedPosts = buildReplyTree(posts);

  // Calculate total heat for the kettle
  const totalHeat = posts.reduce((sum, p) => sum + (p.heat_score ?? 0), 0);
  const isBoiling = totalHeat >= 100;
  const totalReplies = posts.filter(p => p.parent_post_id).length;
  const parentPostCount = posts.filter(p => !p.parent_post_id).length;

  // Real-time subscription for new posts
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createSupabaseClient();
    
    const channel = supabase
      .channel(`kettle-${kettle.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `kettle_id=eq.${kettle.id}`
        },
        async () => {
          // Refetch all posts when there's a change
          const { data: newPosts } = await supabase
            .from("posts")
            .select("id, content, image_url, heat_score, anonymous_identity, parent_post_id, created_at")
            .eq("kettle_id", kettle.id)
            .order("created_at", { ascending: false });
          
          if (newPosts) {
            setPosts(newPosts);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [kettle.id]);

  const handleRefresh = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      router.refresh();
      return;
    }

    setIsRefreshing(true);
    try {
      const supabase = createSupabaseClient();
      const { data: newPosts } = await supabase
        .from("posts")
        .select("id, content, image_url, heat_score, anonymous_identity, parent_post_id, created_at")
        .eq("kettle_id", kettle.id)
        .order("created_at", { ascending: false });
      
      if (newPosts) {
        setPosts(newPosts);
      }
    } catch (error) {
      console.error('Failed to refresh:', error);
      router.refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [kettle.id, router]);

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
        <div className="glass-strong rounded-xl border border-white/10 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Total Heat
            </span>
            <span className={`text-lg font-bold ${isBoiling ? 'text-hot-pink' : 'text-neon-green'}`}>
              {totalHeat}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-charcoal-light">
            <motion.div
              className={`h-full ${isBoiling ? 'bg-gradient-to-r from-hot-pink to-orange-500' : 'bg-gradient-to-r from-neon-green to-hot-pink'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(totalHeat, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-medium text-zinc-500">
            <span>{parentPostCount} posts • {totalReplies} replies</span>
            <span>{isBoiling ? '🔥 On fire!' : `${Math.max(100 - totalHeat, 0)} to boil`}</span>
          </div>
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
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 glass px-3 py-1.5 text-[11px] font-bold text-zinc-300 hover:border-hot-pink/40 hover:text-hot-pink disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isRefreshing ? '⏳' : '🔄'} {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </motion.button>
        </div>

        <p className="text-[11px] font-medium text-zinc-500">
          💡 Real-time updates enabled. New posts and replies appear automatically!
        </p>
      </section>

      <section className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">
            Kettle Feed
          </h2>
          <span className="text-[11px] font-medium text-zinc-500">
            {parentPostCount} {parentPostCount === 1 ? 'thread' : 'threads'}
          </span>
        </div>

        <motion.div
          className="space-y-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {threadedPosts.length === 0 ? (
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
              threadedPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  kettleId={kettle.id}
                  kettleName={kettle.name}
                  onNewReply={handleRefresh}
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

