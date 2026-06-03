-- Owner-scoped public collection URLs (/u/[username]/[collection-slug])
-- Run AFTER 012 in Supabase SQL Editor

drop index if exists boards_slug_unique;

create unique index if not exists boards_owner_slug_unique
  on public.boards (owner_id, slug)
  where deleted_at is null and slug is not null;

create index if not exists boards_public_mood_updated_idx
  on public.boards (mood, updated_at desc)
  where is_public = true and deleted_at is null;

create index if not exists boards_public_owner_updated_idx
  on public.boards (owner_id, updated_at desc)
  where is_public = true and deleted_at is null;
