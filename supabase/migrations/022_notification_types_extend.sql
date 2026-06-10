-- Extend notification types for creator economy features.

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'board_invite',
    'board_like',
    'collab_request',
    'item_comment',
    'board_viewed_milestone',
    'item_resaved',
    'board_featured',
    'weekly_digest',
    'badge_earned',
    'collaborator_added'
  ));

DROP POLICY IF EXISTS "notifications_insert_service_v1" ON public.notifications;

CREATE POLICY "notifications_insert_service_v1"
  ON public.notifications FOR INSERT
  WITH CHECK (true);
