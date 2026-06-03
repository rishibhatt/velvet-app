-- Security hardening: fix exploitable RLS policies and add performance indexes
-- Run AFTER 013 in Supabase SQL Editor

-- ---------------------------------------------------------------------------
-- board_members: remove self-join-any-board exploit
-- ---------------------------------------------------------------------------
drop policy if exists "board_members_insert_v3" on board_members;

create policy "board_members_insert_v4"
  on board_members for insert
  with check (
    public.is_board_owner(board_id)
    or (
      public.is_board_member(board_id)
      and exists (
        select 1 from public.board_members bm
        where bm.board_id = board_members.board_id
          and bm.user_id = auth.uid()
          and bm.role = 'admin'
      )
    )
  );

-- ---------------------------------------------------------------------------
-- comments: require board access
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated users can comment" on comments;

create policy "comments_insert_v2"
  on comments for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.items i
      where i.id = comments.item_id
        and public.can_access_board(i.board_id)
    )
  );

-- ---------------------------------------------------------------------------
-- activity_logs: require board access
-- ---------------------------------------------------------------------------
drop policy if exists "Members can insert activity" on activity_logs;

create policy "activity_logs_insert_v2"
  on activity_logs for insert
  with check (
    user_id = auth.uid()
    and public.can_access_board(board_id)
  );

-- ---------------------------------------------------------------------------
-- storage: restrict uploads to own folder prefix
-- ---------------------------------------------------------------------------
drop policy if exists "velvet_uploads_insert" on storage.objects;

create policy "velvet_uploads_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'velvet-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Performance indexes for pagination and previews
-- ---------------------------------------------------------------------------
create index if not exists items_board_active_created_idx
  on public.items (board_id, created_at desc)
  where deleted_at is null;

create index if not exists items_board_active_image_idx
  on public.items (board_id, created_at desc)
  where deleted_at is null and image_url is not null;

-- ---------------------------------------------------------------------------
-- RPC: top preview images per board (avoids full item scan)
-- ---------------------------------------------------------------------------
create or replace function public.get_board_preview_images(p_board_ids uuid[])
returns table (board_id uuid, image_url text, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select board_id, image_url, created_at
  from (
    select
      i.board_id,
      i.image_url,
      i.created_at,
      row_number() over (
        partition by i.board_id
        order by i.created_at desc
      ) as rn
    from public.items i
    where i.board_id = any(p_board_ids)
      and i.deleted_at is null
      and i.image_url is not null
  ) ranked
  where rn <= 4;
$$;

grant execute on function public.get_board_preview_images(uuid[]) to authenticated, anon;

-- ---------------------------------------------------------------------------
-- RPC: delete user account (soft-delete owned data, caller must match)
-- ---------------------------------------------------------------------------
create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  update public.boards
    set deleted_at = now()
    where owner_id = v_user_id and deleted_at is null;

  update public.items
    set deleted_at = now()
    where board_id in (
      select id from public.boards where owner_id = v_user_id
    )
    and deleted_at is null;

  delete from public.board_members where user_id = v_user_id;

  delete from public.board_likes where user_id = v_user_id;

  delete from public.notifications where user_id = v_user_id;

  delete from public.board_invitations
    where inviter_id = v_user_id or invitee_id = v_user_id;

  delete from public.profiles where id = v_user_id;
end;
$$;

grant execute on function public.delete_user_account() to authenticated;
