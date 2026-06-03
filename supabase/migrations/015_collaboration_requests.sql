-- Collaboration requests (visitor → owner) with notifications and approval flow.
-- Run after 012_notifications_and_invitations.sql.

create table if not exists public.board_collaboration_requests (
  id uuid default uuid_generate_v4() primary key,
  board_id uuid not null references public.boards(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'editor' check (role in ('viewer', 'editor', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'denied')),
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists board_collaboration_requests_pending_unique
  on public.board_collaboration_requests(board_id, requester_id)
  where status = 'pending';

create index if not exists board_collaboration_requests_board_id_idx
  on public.board_collaboration_requests(board_id);
create index if not exists board_collaboration_requests_requester_id_idx
  on public.board_collaboration_requests(requester_id);

alter table public.board_collaboration_requests enable row level security;

drop policy if exists "board_collaboration_requests_select_v1" on public.board_collaboration_requests;

create policy "board_collaboration_requests_select_v1"
  on public.board_collaboration_requests for select
  using (
    requester_id = auth.uid()
    or public.is_board_owner(board_id)
    or exists (
      select 1 from public.board_members bm
      where bm.board_id = board_collaboration_requests.board_id
        and bm.user_id = auth.uid()
        and bm.role = 'admin'
    )
  );

alter table public.notifications drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (type in ('board_invite', 'board_like', 'collab_request'));

create or replace function public.create_collaboration_request(
  p_board_id uuid,
  p_role text default 'editor'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request_id uuid;
  v_board_title text;
  v_owner_id uuid;
  v_requester_name text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if p_role not in ('viewer', 'editor', 'admin') then
    raise exception 'Invalid collaborator role';
  end if;

  select title, owner_id
    into v_board_title, v_owner_id
    from public.boards
    where id = p_board_id
      and deleted_at is null;

  if v_board_title is null then
    raise exception 'Collection not found';
  end if;

  if v_owner_id = auth.uid() then
    raise exception 'You already manage this collection.';
  end if;

  if exists (
    select 1 from public.board_members bm
    where bm.board_id = p_board_id
      and bm.user_id = auth.uid()
  ) then
    raise exception 'You are already a collaborator on this collection.';
  end if;

  if exists (
    select 1 from public.board_invitations bi
    where bi.board_id = p_board_id
      and bi.invitee_id = auth.uid()
      and bi.status = 'pending'
  ) then
    raise exception 'You already have a pending invite for this collection.';
  end if;

  if exists (
    select 1 from public.board_collaboration_requests bcr
    where bcr.board_id = p_board_id
      and bcr.requester_id = auth.uid()
      and bcr.status = 'pending'
  ) then
    raise exception 'You already sent a collaboration request for this collection.';
  end if;

  select coalesce(nullif(full_name, ''), username, 'Someone')
    into v_requester_name
    from public.profiles
    where id = auth.uid();

  insert into public.board_collaboration_requests (board_id, requester_id, role)
  values (p_board_id, auth.uid(), p_role)
  returning id into v_request_id;

  insert into public.activity_logs (board_id, user_id, action, entity, entity_id, metadata)
  values (
    p_board_id,
    auth.uid(),
    'requested to collaborate',
    'collaboration_request',
    v_request_id,
    jsonb_build_object('kind', 'collab_request', 'role', p_role)
  );

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
    v_owner_id,
    auth.uid(),
    'collab_request',
    'Collaboration request',
    v_requester_name || ' wants to collaborate on "' || v_board_title || '".',
    'board',
    p_board_id,
    jsonb_build_object(
      'requestId', v_request_id,
      'boardId', p_board_id,
      'boardTitle', v_board_title,
      'role', p_role,
      'status', 'pending',
      'direction', 'to_owner'
    )
  );

  return v_request_id;
end;
$$;

revoke all on function public.create_collaboration_request(uuid, text) from public;
grant execute on function public.create_collaboration_request(uuid, text) to authenticated;

create or replace function public.respond_collaboration_request(
  p_request_id uuid,
  p_accept boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.board_collaboration_requests%rowtype;
  v_board_title text;
  v_owner_name text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select *
    into v_request
    from public.board_collaboration_requests
    where id = p_request_id
      and status = 'pending'
    for update;

  if v_request.id is null then
    raise exception 'Request not found or already resolved.';
  end if;

  if not public.can_manage_board_invites(v_request.board_id) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  select title into v_board_title from public.boards where id = v_request.board_id;
  select coalesce(nullif(full_name, ''), username, 'Someone')
    into v_owner_name
    from public.profiles
    where id = auth.uid();

  if p_accept then
    insert into public.board_members (board_id, user_id, role)
    values (v_request.board_id, v_request.requester_id, v_request.role)
    on conflict (board_id, user_id) do update
      set role = excluded.role;

    update public.board_collaboration_requests
      set status = 'accepted', responded_at = now()
      where id = p_request_id;

    insert into public.activity_logs (board_id, user_id, action, entity, entity_id, metadata)
    values (
      v_request.board_id,
      auth.uid(),
      'accepted a collaboration request',
      'collaboration_request',
      p_request_id,
      jsonb_build_object('requesterId', v_request.requester_id, 'role', v_request.role)
    );
  else
    update public.board_collaboration_requests
      set status = 'denied', responded_at = now()
      where id = p_request_id;

    insert into public.activity_logs (board_id, user_id, action, entity, entity_id, metadata)
    values (
      v_request.board_id,
      auth.uid(),
      'declined a collaboration request',
      'collaboration_request',
      p_request_id,
      jsonb_build_object('requesterId', v_request.requester_id)
    );
  end if;

  update public.notifications
    set
      read_at = coalesce(read_at, now()),
      metadata = coalesce(metadata, '{}'::jsonb)
        || jsonb_build_object('status', case when p_accept then 'accepted' else 'denied' end)
    where type = 'collab_request'
      and metadata->>'requestId' = p_request_id::text
      and metadata->>'direction' = 'to_owner';

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
    v_request.requester_id,
    auth.uid(),
    'collab_request',
    case when p_accept then 'Request accepted' else 'Request declined' end,
    v_owner_name || ' '
      || case when p_accept then 'accepted' else 'declined' end
      || ' your request to collaborate on "'
      || coalesce(v_board_title, 'the collection')
      || '".',
    'board',
    v_request.board_id,
    jsonb_build_object(
      'requestId', p_request_id,
      'boardId', v_request.board_id,
      'boardTitle', v_board_title,
      'role', v_request.role,
      'status', case when p_accept then 'accepted' else 'denied' end,
      'direction', 'to_requester'
    )
  );

  return v_request.board_id;
end;
$$;

revoke all on function public.respond_collaboration_request(uuid, boolean) from public;
grant execute on function public.respond_collaboration_request(uuid, boolean) to authenticated;
