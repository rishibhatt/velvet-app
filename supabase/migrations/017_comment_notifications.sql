-- Notify collection owners on item comments and likes (including private collections).

alter table public.notifications drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (type in ('board_invite', 'board_like', 'collab_request', 'item_comment'));

create or replace function public.create_item_comment_notification(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_board_id uuid;
  v_board_owner uuid;
  v_board_title text;
  v_slug text;
  v_item_title text;
  v_actor_name text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select i.board_id, coalesce(nullif(trim(i.title), ''), 'a save')
    into v_board_id, v_item_title
    from public.items i
    where i.id = p_item_id
      and i.deleted_at is null;

  if v_board_id is null then
    return;
  end if;

  select b.owner_id, b.title, b.slug
    into v_board_owner, v_board_title, v_slug
    from public.boards b
    where b.id = v_board_id
      and b.deleted_at is null;

  if v_board_owner is null or v_board_owner = auth.uid() then
    return;
  end if;

  if exists (
    select 1 from public.notifications n
    where n.recipient_id = v_board_owner
      and n.actor_id = auth.uid()
      and n.type = 'item_comment'
      and n.resource_type = 'item'
      and n.resource_id = p_item_id
      and n.created_at > now() - interval '6 hours'
  ) then
    return;
  end if;

  select coalesce(nullif(full_name, ''), username, 'Someone')
    into v_actor_name
    from public.profiles
    where id = auth.uid();

  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    title,
    body,
    resource_type,
    resource_id,
    metadata
  )
  values (
    v_board_owner,
    auth.uid(),
    'item_comment',
    'New comment',
    v_actor_name || ' commented on "' || v_item_title || '" in "' || v_board_title || '".',
    'item',
    p_item_id,
    jsonb_build_object(
      'boardId', v_board_id,
      'boardTitle', v_board_title,
      'itemId', p_item_id,
      'itemTitle', v_item_title,
      'slug', v_slug
    )
  );
end;
$$;

revoke all on function public.create_item_comment_notification(uuid) from public;
grant execute on function public.create_item_comment_notification(uuid) to authenticated;

create or replace function public.create_board_like_notification(p_board_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_board_owner uuid;
  v_board_title text;
  v_actor_name text;
  v_slug text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select owner_id, title, slug
    into v_board_owner, v_board_title, v_slug
    from public.boards
    where id = p_board_id
      and deleted_at is null;

  if v_board_owner is null or v_board_owner = auth.uid() then
    return;
  end if;

  if exists (
    select 1 from public.notifications n
    where n.recipient_id = v_board_owner
      and n.actor_id = auth.uid()
      and n.type = 'board_like'
      and n.resource_type = 'board'
      and n.resource_id = p_board_id
      and n.created_at > now() - interval '24 hours'
  ) then
    return;
  end if;

  select coalesce(nullif(full_name, ''), username, 'Someone')
    into v_actor_name
    from public.profiles
    where id = auth.uid();

  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    title,
    body,
    resource_type,
    resource_id,
    metadata
  )
  values (
    v_board_owner,
    auth.uid(),
    'board_like',
    'New collection like',
    v_actor_name || ' liked "' || v_board_title || '".',
    'board',
    p_board_id,
    jsonb_build_object('boardId', p_board_id, 'boardTitle', v_board_title, 'slug', v_slug)
  );
end;
$$;
