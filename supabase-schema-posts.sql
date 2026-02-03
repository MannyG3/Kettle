-- Run this in Supabase: SQL Editor → New query → paste → Run
-- Creates posts table and RLS so "Pour the Tea" works (anonymous insert + read).

-- Posts table (required for Pour the Tea)
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kettle_id uuid NOT NULL REFERENCES public.kettles(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  heat_score integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_kettle_id_created_at_idx
  ON public.posts (kettle_id, created_at DESC);

-- Allow anonymous read and insert (no auth required)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_select" ON public.posts;
CREATE POLICY "posts_select" ON public.posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "posts_insert" ON public.posts;
CREATE POLICY "posts_insert" ON public.posts
  FOR INSERT WITH CHECK (true);

-- Optional: allow anonymous update for heat_score (upvotes later)
-- DROP POLICY IF EXISTS "posts_update_heat" ON public.posts;
-- CREATE POLICY "posts_update_heat" ON public.posts
--   FOR UPDATE USING (true) WITH CHECK (true);
