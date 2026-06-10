-- Affiliate link programs and click tracking.

CREATE TABLE IF NOT EXISTS public.affiliate_programs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  base_domains     TEXT[] NOT NULL,
  tracking_param   TEXT NOT NULL,
  affiliate_value  TEXT NOT NULL,
  commission_notes TEXT,
  is_active        BOOLEAN DEFAULT TRUE
);

INSERT INTO public.affiliate_programs (name, base_domains, tracking_param, affiliate_value, commission_notes)
SELECT * FROM (VALUES
  ('Amazon Associates IN', ARRAY['amazon.in','amzn.in']::TEXT[], 'tag', 'velvet-in-21', '2-9% category dependent'),
  ('Booking.com', ARRAY['booking.com']::TEXT[], 'aid', 'REPLACE_WITH_BOOKING_AID', '4% on stays'),
  ('MakeMyTrip', ARRAY['makemytrip.com']::TEXT[], 'affid', 'REPLACE_WITH_MMT_ID', 'via CueLinks'),
  ('Flipkart', ARRAY['flipkart.com','fkrt.it']::TEXT[], 'affExtParam1', 'REPLACE_WITH_FK_ID', 'via CueLinks')
) AS v(name, base_domains, tracking_param, affiliate_value, commission_notes)
WHERE NOT EXISTS (SELECT 1 FROM public.affiliate_programs LIMIT 1);

CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id               UUID REFERENCES public.items(id) ON DELETE SET NULL,
  affiliate_program_id  UUID REFERENCES public.affiliate_programs(id),
  original_url          TEXT,
  rewritten_url         TEXT,
  clicked_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.affiliate_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "affiliate_programs_select_v1" ON public.affiliate_programs;
DROP POLICY IF EXISTS "affiliate_clicks_insert_v1" ON public.affiliate_clicks;

CREATE POLICY "affiliate_programs_select_v1"
  ON public.affiliate_programs FOR SELECT USING (true);

CREATE POLICY "affiliate_clicks_insert_v1"
  ON public.affiliate_clicks FOR INSERT WITH CHECK (true);
