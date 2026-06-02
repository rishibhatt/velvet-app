-- Optional display label when mood is "other" or user names a custom vibe
alter table public.boards add column if not exists mood_label text;

comment on column public.boards.mood_label is 'User-facing mood name; mood column stays a preset category slug.';
