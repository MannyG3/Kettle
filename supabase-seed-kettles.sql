-- Run this in Supabase: SQL Editor → New query → paste → Run
-- Creates kettles table if missing, then inserts the kettles used by the app.

-- Create kettles table if you haven't already (from your schema)
CREATE TABLE IF NOT EXISTS public.kettles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Insert the kettles (ignore if slug already exists)
INSERT INTO public.kettles (name, slug, description)
VALUES
  ('Campus Chaos', 'campus-chaos', 'Dorm drama, roommate rants, and lecture legends.'),
  ('Situationships', 'situationships', 'Red flags, green texts, and delulu lore.'),
  ('Workplace Whispers', 'workplace-whispers', 'Boss gossip, Slack screenshots, and HR horror stories.')
ON CONFLICT (slug) DO NOTHING;
