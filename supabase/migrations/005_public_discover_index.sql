-- Speed up public discover feeds (mood + sort by created_at)
create index if not exists boards_public_mood_created_idx
  on boards (mood, created_at desc)
  where is_public = true and deleted_at is null;

create index if not exists profiles_username_trgm_idx
  on profiles (username text_pattern_ops);
