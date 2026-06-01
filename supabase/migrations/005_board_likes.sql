-- Collection likes (for trending / discover)
-- Run AFTER 004 in Supabase SQL Editor

create table if not exists public.board_likes (
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (board_id, user_id)
);

create index if not exists board_likes_board_id_idx on public.board_likes(board_id);
create index if not exists board_likes_user_id_idx on public.board_likes(user_id);
create index if not exists board_likes_created_at_idx on public.board_likes(created_at desc);

alter table public.board_likes enable row level security;

drop policy if exists "board_likes_select" on public.board_likes;
drop policy if exists "board_likes_insert" on public.board_likes;
drop policy if exists "board_likes_delete" on public.board_likes;

-- Anyone can read like counts on public collections
create policy "board_likes_select"
  on public.board_likes for select
  using (
    exists (
      select 1 from public.boards b
      where b.id = board_likes.board_id
        and b.is_public = true
        and b.deleted_at is null
    )
    or user_id = auth.uid()
  );

-- Like only public collections you do not own
create policy "board_likes_insert"
  on public.board_likes for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.boards b
      where b.id = board_id
        and b.is_public = true
        and b.deleted_at is null
        and b.owner_id <> auth.uid()
    )
  );

create policy "board_likes_delete"
  on public.board_likes for delete
  using (user_id = auth.uid());
