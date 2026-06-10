-- Brand collections and ad campaigns.

ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS is_brand_collection BOOLEAN DEFAULT FALSE;
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS brand_name          TEXT;
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS brand_cta_url       TEXT;
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS brand_cta_text      TEXT;

CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name       TEXT NOT NULL,
  brand_logo_url   TEXT,
  type             TEXT NOT NULL CHECK (type IN ('promoted_collection','promoted_item','category_sponsor')),
  target_moods     TEXT[] DEFAULT '{}',
  budget_notes     TEXT,
  cpc_paise        INTEGER DEFAULT 500,
  cpm_paise        INTEGER DEFAULT 1500,
  status           TEXT DEFAULT 'active' CHECK (status IN ('active','paused','completed')),
  start_date       DATE,
  end_date         DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ad_units (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  board_id     UUID REFERENCES public.boards(id) ON DELETE SET NULL,
  headline     TEXT,
  cta_text     TEXT DEFAULT 'View Collection',
  cta_url      TEXT NOT NULL,
  image_url    TEXT,
  placement    TEXT NOT NULL CHECK (placement IN ('explore_feed','mood_page','search_results')),
  impressions  INTEGER DEFAULT 0,
  clicks       INTEGER DEFAULT 0,
  is_active    BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.ad_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_unit_id     UUID NOT NULL REFERENCES public.ad_units(id) ON DELETE CASCADE,
  event_type     TEXT NOT NULL CHECK (event_type IN ('impression','click')),
  user_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  fingerprint    TEXT,
  mood_context   TEXT,
  occurred_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_units_active ON public.ad_units(placement, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_ad_events_unit  ON public.ad_events(ad_unit_id, occurred_at DESC);

ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ad_units_select_active_v1" ON public.ad_units;
DROP POLICY IF EXISTS "ad_events_insert_v1" ON public.ad_events;
DROP POLICY IF EXISTS "ad_campaigns_manage_v1" ON public.ad_campaigns;

CREATE POLICY "ad_units_select_active_v1"
  ON public.ad_units FOR SELECT USING (is_active = TRUE);

CREATE POLICY "ad_events_insert_v1"
  ON public.ad_events FOR INSERT WITH CHECK (true);

CREATE POLICY "ad_campaigns_manage_v1"
  ON public.ad_campaigns FOR ALL WITH CHECK (true);
