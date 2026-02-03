-- Run this in Supabase: SQL Editor -> New query -> paste -> Run

create or replace function increment_heat(post_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.posts
  set heat_score = heat_score + 1
  where id = post_id;
end;
$$;
