-- Re-saves (inspired-by) social signal.

CREATE TABLE IF NOT EXISTS public.item_resaves (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_item_id  UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  original_board_id UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  original_owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resaved_item_id   UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  resaved_board_id  UUID NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  resaved_by        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.items ADD COLUMN IF NOT EXISTS resave_count         INTEGER DEFAULT 0;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS inspired_by_item_id  UUID REFERENCES public.items(id) ON DELETE SET NULL;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS inspired_by_board_id UUID REFERENCES public.boards(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_resaves_original   ON public.item_resaves(original_item_id);
CREATE INDEX IF NOT EXISTS idx_resaves_resaved_by ON public.item_resaves(resaved_by);
CREATE INDEX IF NOT EXISTS idx_resaves_board      ON public.item_resaves(original_board_id);

ALTER TABLE public.item_resaves ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "item_resaves_insert_v1" ON public.item_resaves;
DROP POLICY IF EXISTS "item_resaves_select_v1" ON public.item_resaves;

CREATE POLICY "item_resaves_insert_v1"
  ON public.item_resaves FOR INSERT WITH CHECK (auth.uid() = resaved_by);

CREATE POLICY "item_resaves_select_v1"
  ON public.item_resaves FOR SELECT USING (true);
