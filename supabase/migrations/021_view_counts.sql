-- View tracking and denormalized counters.

CREATE TABLE IF NOT EXISTS public.board_views (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id            UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  viewer_id           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  viewer_fingerprint  TEXT NOT NULL,
  viewed_at           TIMESTAMPTZ DEFAULT NOW(),
  source              TEXT CHECK (source IN ('explore','direct','share','search','category','tag')),
  referrer            TEXT
);

ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS view_count        INTEGER DEFAULT 0;
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS unique_view_count INTEGER DEFAULT 0;
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS weekly_view_count INTEGER DEFAULT 0;
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS last_viewed_at    TIMESTAMPTZ;
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS trending_score    NUMERIC DEFAULT 0;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_board_views  INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weekly_reach       INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified        BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified_at        TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_score      INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_digest_enabled BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_board_views_board_id   ON public.board_views(board_id);
CREATE INDEX IF NOT EXISTS idx_board_views_viewed_at  ON public.board_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_board_views_dedup      ON public.board_views(board_id, viewer_fingerprint, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_boards_trending        ON public.boards(trending_score DESC) WHERE is_public = TRUE;

ALTER TABLE public.board_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "board_views_insert_v1" ON public.board_views;
DROP POLICY IF EXISTS "board_views_select_owner_v1" ON public.board_views;

CREATE POLICY "board_views_insert_v1"
  ON public.board_views FOR INSERT WITH CHECK (true);

CREATE POLICY "board_views_select_owner_v1"
  ON public.board_views FOR SELECT
  USING (board_id IN (SELECT id FROM public.boards WHERE owner_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.increment_board_view(
  p_board_id UUID,
  p_is_unique BOOLEAN,
  p_owner_id UUID
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.boards SET
    view_count        = view_count + 1,
    unique_view_count = unique_view_count + (CASE WHEN p_is_unique THEN 1 ELSE 0 END),
    weekly_view_count = weekly_view_count + 1,
    last_viewed_at    = NOW()
  WHERE id = p_board_id;

  UPDATE public.profiles SET
    total_board_views = total_board_views + 1,
    weekly_reach      = weekly_reach + (CASE WHEN p_is_unique THEN 1 ELSE 0 END)
  WHERE id = p_owner_id;
END;
$$;
