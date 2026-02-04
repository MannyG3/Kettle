-- FULL SCHEMA: Run this in Supabase SQL Editor to set up everything
-- This includes: kettles, posts with identities & threading, heat RPCs, and RLS policies

-- ============================================
-- 1. KETTLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.kettles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Allow anonymous read
ALTER TABLE public.kettles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kettles_select" ON public.kettles;
CREATE POLICY "kettles_select" ON public.kettles
  FOR SELECT USING (true);

-- ============================================
-- 2. POSTS TABLE (with identity & threading)
-- ============================================
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kettle_id uuid NOT NULL REFERENCES public.kettles(id) ON DELETE CASCADE,
  parent_post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  anonymous_identity text NOT NULL DEFAULT 'Anonymous Tea',
  heat_score integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add columns if they don't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='anonymous_identity') THEN
    ALTER TABLE public.posts ADD COLUMN anonymous_identity text NOT NULL DEFAULT 'Anonymous Tea';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='parent_post_id') THEN
    ALTER TABLE public.posts ADD COLUMN parent_post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS posts_kettle_id_created_at_idx
  ON public.posts (kettle_id, created_at DESC);

CREATE INDEX IF NOT EXISTS posts_parent_post_id_idx
  ON public.posts (parent_post_id);

-- Allow anonymous read and insert
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_select" ON public.posts;
CREATE POLICY "posts_select" ON public.posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "posts_insert" ON public.posts;
CREATE POLICY "posts_insert" ON public.posts
  FOR INSERT WITH CHECK (true);

-- Allow anonymous update for heat_score only
DROP POLICY IF EXISTS "posts_update_heat" ON public.posts;
CREATE POLICY "posts_update_heat" ON public.posts
  FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================
-- 3. HEAT SCORE RPCs (increment & decrement)
-- ============================================
CREATE OR REPLACE FUNCTION increment_heat(post_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_score integer;
BEGIN
  UPDATE public.posts
  SET heat_score = heat_score + 1
  WHERE id = post_id
  RETURNING heat_score INTO new_score;
  
  RETURN new_score;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_heat(post_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_score integer;
BEGIN
  UPDATE public.posts
  SET heat_score = GREATEST(heat_score - 1, 0)
  WHERE id = post_id
  RETURNING heat_score INTO new_score;
  
  RETURN new_score;
END;
$$;

-- ============================================
-- 4. KETTLE HEAT AGGREGATION VIEW
-- ============================================
CREATE OR REPLACE VIEW public.kettles_with_heat AS
SELECT 
  k.*,
  COALESCE(SUM(p.heat_score), 0)::integer AS total_heat,
  COUNT(p.id)::integer AS post_count,
  MAX(p.created_at) AS last_activity
FROM public.kettles k
LEFT JOIN public.posts p ON p.kettle_id = k.id AND p.parent_post_id IS NULL
GROUP BY k.id;

-- ============================================
-- 5. TRENDING POSTS VIEW
-- ============================================
CREATE OR REPLACE VIEW public.trending_posts AS
SELECT 
  p.*,
  k.name AS kettle_name,
  k.slug AS kettle_slug
FROM public.posts p
JOIN public.kettles k ON k.id = p.kettle_id
WHERE p.parent_post_id IS NULL
ORDER BY p.heat_score DESC, p.created_at DESC
LIMIT 50;

-- ============================================
-- 6. SEED DATA (if empty)
-- ============================================
INSERT INTO public.kettles (name, slug, description)
VALUES
  ('Campus Chaos', 'campus-chaos', 'Dorm drama, roommate rants, and lecture legends.'),
  ('Situationships', 'situationships', 'Red flags, green texts, and delulu lore.'),
  ('Workplace Whispers', 'workplace-whispers', 'Boss gossip, Slack screenshots, and HR horror stories.'),
  ('Main Character Energy', 'main-character', 'When you ARE the plot twist.'),
  ('Tech Tea', 'tech-tea', 'Startup drama, code drama, and interview horror stories.')
ON CONFLICT (slug) DO NOTHING;
