-- Speed up public explore feeds (mood + recency)
create index if not exists boards_public_created_idx
  on boards (created_at desc)
  where is_public = true and deleted_at is null;

create index if not exists boards_public_mood_created_idx
  on boards (mood, created_at desc)
  where is_public = true and deleted_at is null;

-- Profile lookup by username
create index if not exists profiles_username_idx on profiles (username);
