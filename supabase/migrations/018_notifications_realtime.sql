-- Enable Supabase Realtime for in-app notifications (live bell without refresh).
-- Required for postgres_changes subscriptions in the Velvet client.

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

-- Include full row on UPDATE (mark read, metadata status changes).
alter table public.notifications replica identity full;
en