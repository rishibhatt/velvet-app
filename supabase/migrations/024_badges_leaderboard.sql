-- Creator badges and leaderboard snapshots.

DO $$ BEGIN
  CREATE TYPE public.badge_type AS ENUM (
    'verified_creator',
    'trending',
    'top_curator',
    'rising_star',
    'velvet_pick'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.creator_badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type  public.badge_type NOT NULL,
  mood        TEXT,
  awarded_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ,
  UNIQUE(profile_id, badge_type, mood)
);

CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start   DATE NOT NULL,
  mood         TEXT NOT NULL,
  profile_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rank         INTEGER NOT NULL,
  score        INTEGER NOT NULL,
  week_views   INTEGER DEFAULT 0,
  week_likes   INTEGER DEFAULT 0,
  week_resaves INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_start, mood, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_week_mood ON public.leaderboard_snapshots(week_start DESC, mood, rank ASC);
CREATE INDEX IF NOT EXISTS idx_badges_profile        ON public.creator_badges(profile_id);

ALTER TABLE public.creator_badges       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "creator_badges_select_v1" ON public.creator_badges;
DROP POLICY IF EXISTS "creator_badges_manage_v1" ON public.creator_badges;
DROP POLICY IF EXISTS "leaderboard_snapshots_select_v1" ON public.leaderboard_snapshots;
DROP POLICY IF EXISTS "leaderboard_snapshots_manage_v1" ON public.leaderboard_snapshots;

CREATE POLICY "creator_badges_select_v1"
  ON public.creator_badges FOR SELECT USING (true);

CREATE POLICY "creator_badges_manage_v1"
  ON public.creator_badges FOR ALL WITH CHECK (true);

CREATE POLICY "leaderboard_snapshots_select_v1"
  ON public.leaderboard_snapshots FOR SELECT USING (true);

CREATE POLICY "leaderboard_snapshots_manage_v1"
  ON public.leaderboard_snapshots FOR ALL WITH CHECK (true);
