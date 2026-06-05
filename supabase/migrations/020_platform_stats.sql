-- Public platform stats for auth hero (anon-safe aggregate counts).

create or replace function public.get_platform_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'publicCollections',
    (select count(*)::integer from boards where is_public = true and deleted_at is null),
    'creators',
    (select count(*)::integer from profiles),
    'itemsSaved',
    (select count(*)::integer from items where deleted_at is null)
  );
$$;

grant execute on function public.get_platform_stats() to anon, authenticated;
