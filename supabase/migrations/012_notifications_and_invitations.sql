-- In-app notifications and collaboration approvals.
-- Run after 011_board_editor_update.sql.

create table if not exists public.board_invitations (
  id uuid default uuid_generate_v4() primary key,
  board_id uuid not null references public.boards(id) on delete cascade,
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  invitee_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('viewer', 'editor', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'denied', 'cancelled')),
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists board_invitations_pending_unique
  on public.board_invitations(board_id, invitee_id)
  where status = 'pending';

create index if not exists board_invitations_board_id_idx on public.board_invitations(board_id);
create index if not exists board_invitations_invitee_id_idx on public.board_invitations(invitee_id);
create index if not exists board_invitations_status_idx on public.board_invitations(status);

create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('board_invite', 'board_like')),
  title text not null,
  body text,
  resource_type text,
  resource_id uuid,
  metadata jsonb default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_recipient_created_idx
  on public.notifications(recipient_id, created_at desc);
create index if not exists notifications_recipient_read_idx
  on public.notifications(recipient_id, read_at);
create index if not exists notifications_type_resource_idx
  on public.notifications(type, resource_type, resource_id);

alter table public.board_invitations enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "board_invitations_select_v1" on public.board_invitations;
drop policy if exists "board_invitations_update_v1" on public.board_invitations;
drop policy if exists "notifications_select_v1" on public.notifications;
drop policy if exists "notifications_update_v1" on public.notifications;

create policy "board_invitations_select_v1"
  on public.board_invitations for select
  using (
    invitee_id = auth.uid()
    or inviter_id = auth.uid()
    or public.is_board_owner(board_id)
    or exists (
      select 1 from public.board_members bm
      where bm.board_id = board_invitations.board_id
        and bm.user_id = auth.uid()
        and bm.role = 'admin'
    )
  );

create policy "board_invitations_update_v1"
  on public.board_invitations for update
  using (invitee_id = auth.uid())
  with check (invitee_id = auth.uid());

create policy "notifications_select_v1"
  on public.notifications for select
  using (recipient_id = auth.uid());

create policy "notifications_update_v1"
  on public.notifications for update
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

create or replace function public.can_manage_board_invites(p_board_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_board_owner(p_board_id)
    or exists (
      select 1 from public.board_members bm
      where bm.board_id = p_board_id
        and bm.user_id = auth.uid()
        and bm.role = 'admin'
    );
$$;

grant execute on function public.can_manage_board_invites(uuid) to authenticated;

create or replace function public.create_board_invitation(
  p_board_id uuid,
  p_invitee_id uuid,
  p_role text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation_id uuid;
  v_board_title text;
  v_inviter_name text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if p_role not in ('viewer', 'editor', 'admin') then
    raise exception 'Invalid collaborator role';
  end if;

  if not public.can_manage_board_invites(p_board_id) then
    raise exception 'Permission denied' using errcode = '42501';
  end if;

  select title
    into v_board_title
    from public.boards
    where id = p_board_id
      and deleted_at is null;

  if v_board_title is null then
    raise exception 'Collection not found';
  end if;

  if exists (
    select 1 from public.boards b
    where b.id = p_board_id
      and b.owner_id = p_invitee_id
  ) then
    raise exception 'This person already owns the collection.';
  end if;

  if exists (
    select 1 from public.board_members bm
    where bm.board_id = p_board_id
      and bm.user_id = p_invitee_id
  ) then
    raise exception 'They are already a collaborator on this collection.';
  end if;

  select coalesce(nullif(full_name, ''), username, 'Someone')
    into v_inviter_name
    from public.profiles
    where id = auth.uid();

  insert into public.board_invitations (board_id, inviter_id, invitee_id, role)
  values (p_board_id, auth.uid(), p_invitee_id, p_role)
  returning id into v_invitation_id;

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
    p_invitee_id,
    auth.uid(),
    'board_invite',
    'Collection invite',
    v_inviter_name || ' invited you to collaborate on "' || v_board_title || '".',
    'board',
    p_board_id,
    jsonb_build_object(
      'invitationId', v_invitation_id,
      'boardId', p_board_id,
      'boardTitle', v_board_title,
      'role', p_role,
      'status', 'pending'
    )
  );

  insert into public.activity_logs (board_id, user_id, action, entity, entity_id, metadata)
  values (
    p_board_id,
    auth.uid(),
    'sent a collaboration invite',
    'invitation',
    v_invitation_id,
    jsonb_build_object('inviteeId', p_invitee_id, 'role', p_role)
  );

  return v_invitation_id;
end;
$$;

revoke all on function public.create_board_invitation(uuid, uuid, text) from public;
grant execute on function public.create_board_invitation(uuid, uuid, text) to authenticated;

create or replace function public.respond_board_invitation(
  p_invitation_id uuid,
  p_accept boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation public.board_invitations%rowtype;
  v_board_title text;
  v_actor_name text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  select *
    into v_invitation
    from public.board_invitations
    where id = p_invitation_id
      and invitee_id = auth.uid()
      and status = 'pending'
    for update;

  if v_invitation.id is null then
    raise exception 'Invitation not found or already resolved.';
  end if;

  select title into v_board_title from public.boards where id = v_invitation.board_id;
  select coalesce(nullif(full_name, ''), username, 'Someone')
    into v_actor_name
    from public.profiles
    where id = auth.uid();

  if p_accept then
    insert into public.board_members (board_id, user_id, role)
    values (v_invitation.board_id, auth.uid(), v_invitation.role)
    on conflict (board_id, user_id) do update
      set role = excluded.role;

    update public.board_invitations
      set status = 'accepted', responded_at = now()
      where id = p_invitation_id;

    insert into public.activity_logs (board_id, user_id, action, entity, entity_id, metadata)
    values (
      v_invitation.board_id,
      auth.uid(),
      'accepted the collaboration invite',
      'invitation',
      p_invitation_id,
      jsonb_build_object('role', v_invitation.role)
    );
  else
    update public.board_invitations
      set status = 'denied', responded_at = now()
      where id = p_invitation_id;

    insert into public.activity_logs (board_id, user_id, action, entity, entity_id, metadata)
    values (
      v_invitation.board_id,
      auth.uid(),
      'declined the collaboration invite',
      'invitation',
      p_invitation_id,
      jsonb_build_object('role', v_invitation.role)
    );
  end if;

  update public.notifications
    set
      read_at = coalesce(read_at, now()),
      metadata = coalesce(metadata, '{}'::jsonb)
        || jsonb_build_object('status', case when p_accept then 'accepted' else 'denied' end)
    where recipient_id = auth.uid()
      and type = 'board_invite'
      and metadata->>'invitationId' = p_invitation_id::text;

  if p_accept then
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
      v_invitation.inviter_id,
      auth.uid(),
      'board_invite',
      'Invite accepted',
      v_actor_name || ' accepted your invite to "' || coalesce(v_board_title, 'your collection') || '".',
      'board',
      v_invitation.board_id,
      jsonb_build_object(
        'invitationId', p_invitation_id,
        'boardId', v_invitation.board_id,
        'boardTitle', v_board_title,
        'role', v_invitation.role,
        'status', 'accepted'
      )
    );
  end if;

  return v_invitation.board_id;
end;
$$;

revoke all on function public.respond_board_invitation(uuid, boolean) from public;
grant execute on function public.respond_board_invitation(uuid, boolean) to authenticated;

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
      and is_public = true
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

revoke all on function public.create_board_like_notification(uuid) from public;
grant execute on function public.create_board_like_notification(uuid) to authenticated;
