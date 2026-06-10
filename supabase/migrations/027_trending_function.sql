-- Recompute trending_score for all public boards.

CREATE OR REPLACE FUNCTION public.update_all_trending_scores()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.boards b SET trending_score = (
    COALESCE((
      SELECT COUNT(*) FROM public.board_views bv
      WHERE bv.board_id = b.id AND bv.viewed_at > NOW() - INTERVAL '24 hours'
    ), 0) * 2.0
    +
    COALESCE((
      SELECT COUNT(*) FROM public.board_views bv
      WHERE bv.board_id = b.id AND bv.viewed_at > NOW() - INTERVAL '7 days'
    ), 0) * 0.5
    +
    COALESCE((
      SELECT COUNT(*) FROM public.board_likes bl
      WHERE bl.board_id = b.id AND bl.created_at > NOW() - INTERVAL '7 days'
    ), 0) * 5.0
    +
    COALESCE((
      SELECT COUNT(*) FROM public.item_resaves ir
      WHERE ir.original_board_id = b.id AND ir.created_at > NOW() - INTERVAL '7 days'
    ), 0) * 8.0
  )
  * (CASE WHEN b.updated_at > NOW() - INTERVAL '48 hours' THEN 1.5 ELSE 1.0 END)
  * (CASE WHEN b.created_at > NOW() - INTERVAL '14 days' THEN 1.3 ELSE 1.0 END)
  WHERE b.is_public = TRUE AND b.deleted_at IS NULL;
END;
$$;
