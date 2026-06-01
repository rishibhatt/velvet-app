-- Slugs for public collection URLs (/c/[slug])
-- Run AFTER 003 in Supabase SQL Editor

alter table boards add column if not exists slug text;

create unique index if not exists boards_slug_unique
  on boards (slug)
  where deleted_at is null and slug is not null;

-- Backfill slugs for existing boards
update boards
set slug = lower(regexp_replace(regexp_replace(trim(title), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
    || '-' || left(replace(id::text, '-', ''), 8)
where slug is null and deleted_at is null;

-- Items: owners and board editors can soft-delete / update any item on their board
drop policy if exists "Item owner can update" on items;
drop policy if exists "Item owner can delete" on items;

create policy "items_update_v2"
  on items for update
  using (
    deleted_at is null
    and (
      user_id = auth.uid()
      or public.is_board_owner(board_id)
      or (
        public.is_board_member(board_id)
        and exists (
          select 1 from public.board_members bm
          where bm.board_id = items.board_id
            and bm.user_id = auth.uid()
            and bm.role in ('editor', 'admin')
        )
      )
    )
  );

create policy "items_delete_v2"
  on items for delete
  using (
    user_id = auth.uid()
    or public.is_board_owner(board_id)
    or (
      public.is_board_member(board_id)
      and exists (
        select 1 from public.board_members bm
        where bm.board_id = items.board_id
          and bm.user_id = auth.uid()
          and bm.role in ('editor', 'admin')
      )
    )
  );

-- Boards: owner can update (public toggle, title, slug, cover)
drop policy if exists "Owner/admin can update board" on boards;
create policy "boards_update_v2"
  on boards for update
  using (
    deleted_at is null
    and (
      owner_id = auth.uid()
      or (
        public.is_board_member(id)
        and exists (
          select 1 from public.board_members bm
          where bm.board_id = boards.id
            and bm.user_id = auth.uid()
            and bm.role = 'admin'
        )
      )
    )
  );
