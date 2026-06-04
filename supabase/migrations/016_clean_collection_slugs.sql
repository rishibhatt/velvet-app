-- Remove legacy UUID suffixes from collection slugs (migration 004 backfill: title-xxxxxxxx)
-- Run AFTER 013 in Supabase SQL Editor

DO $$
DECLARE
  r RECORD;
  base_slug TEXT;
  candidate TEXT;
  n INT;
BEGIN
  FOR r IN
    SELECT id, owner_id, slug
    FROM public.boards
    WHERE deleted_at IS NULL
      AND slug IS NOT NULL
      AND slug ~ '-[0-9a-f]{8}$'
    ORDER BY created_at ASC
  LOOP
    base_slug := regexp_replace(r.slug, '-[0-9a-f]{8}$', '');

    IF base_slug = '' OR length(base_slug) < 2 THEN
      base_slug := 'collection';
    END IF;

    candidate := base_slug;
    n := 2;

    WHILE EXISTS (
      SELECT 1
      FROM public.boards b
      WHERE b.owner_id = r.owner_id
        AND b.slug = candidate
        AND b.id <> r.id
        AND b.deleted_at IS NULL
    ) LOOP
      candidate := base_slug || '-' || n::text;
      n := n + 1;
    END LOOP;

    UPDATE public.boards SET slug = candidate WHERE id = r.id;
  END LOOP;
END $$;
