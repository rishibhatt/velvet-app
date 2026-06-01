-- Fix infinite recursion in RLS (board_members <-> boards)
-- Run this in Supabase SQL Editor AFTER 001 and 002

-- Drop policies that cause recursion
drop policy if exists "Public boards viewable" on boards;
drop policy if exists "View board members for accessible boards" on board_members;
drop policy if exists "Owner can add board members" on board_members;
drop policy if exists "Board members view activity" on activity_logs;
drop policy if exists "Board members view tags" on tags;
drop policy if exists "View item tags for accessible items" on item_tags;
drop policy if exists "View comments on accessible items" on comments;

-- Security definer helpers (bypass RLS for membership checks)
create or replace function public.is_board_owner(p_board_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.boards
    where id = p_board_id
      and owner_id = auth.uid()
      and deleted_at is null
  );
$$;

create or replace function public.is_board_member(p_board_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.board_members
    where board_id = p_board_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.can_access_board(p_board_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.boards b
    where b.id = p_board_id
      and b.deleted_at is null
      and (
        b.owner_id = auth.uid()
        or b.is_public = true
        or public.is_board_member(p_board_id)
      )
  );
$$;

-- Boards
create policy "boards_select_v2"
  on boards for select
  using (
    deleted_at is null
    and (
      owner_id = auth.uid()
      or is_public = true
      or public.is_board_member(id)
    )
  );

-- Board members (no nested board_members in policy)
create policy "board_members_select_v2"
  on board_members for select
  using (
    user_id = auth.uid()
    or public.is_board_owner(board_id)
    or public.is_board_member(board_id)
  );

create policy "board_members_insert_v2"
  on board_members for insert
  with check (
    user_id = auth.uid()
    or public.is_board_owner(board_id)
  );

-- Items
drop policy if exists "Board members view items" on items;
create policy "items_select_v2"
  on items for select
  using (
    deleted_at is null
    and public.can_access_board(board_id)
  );

drop policy if exists "Members can insert items" on items;
create policy "items_insert_v2"
  on items for insert
  with check (
    public.is_board_owner(board_id)
    or public.is_board_member(board_id)
  );

-- Activity logs
create policy "activity_select_v2"
  on activity_logs for select
  using (public.can_access_board(board_id));

-- Tags
create policy "tags_select_v2"
  on tags for select
  using (public.can_access_board(board_id));

create policy "tags_insert_v2"
  on tags for insert
  with check (public.is_board_owner(board_id));

-- Item tags
create policy "item_tags_select_v2"
  on item_tags for select
  using (
    exists (
      select 1 from public.items i
      where i.id = item_tags.item_id
        and public.can_access_board(i.board_id)
    )
  );

create policy "item_tags_insert_v2"
  on item_tags for insert
  with check (
    exists (
      select 1 from public.items i
      where i.id = item_tags.item_id
        and (public.is_board_owner(i.board_id) or public.is_board_member(i.board_id))
    )
  );

-- Comments
create policy "comments_select_v2"
  on comments for select
  using (
    deleted_at is null
    and exists (
      select 1 from public.items i
      where i.id = comments.item_id
        and public.can_access_board(i.board_id)
    )
  );

-- Storage bucket for local uploads
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'velvet-uploads',
  'velvet-uploads',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760;

drop policy if exists "velvet_uploads_insert" on storage.objects;
drop policy if exists "velvet_uploads_select" on storage.objects;
drop policy if exists "velvet_uploads_update" on storage.objects;
drop policy if exists "velvet_uploads_delete" on storage.objects;

create policy "velvet_uploads_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'velvet-uploads');

create policy "velvet_uploads_select"
  on storage.objects for select
  to public
  using (bucket_id = 'velvet-uploads');

create policy "velvet_uploads_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'velvet-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "velvet_uploads_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'velvet-uploads' and auth.uid()::text = (storage.foldername(name))[1]);
