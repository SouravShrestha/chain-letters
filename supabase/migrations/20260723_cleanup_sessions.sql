-- Automatic session cleanup: remove sessions older than 24 hours that are in terminal phases
-- or have been abandoned in lobby for more than 1 hour.
-- 
-- Run this as a Supabase scheduled function (pg_cron or Edge Function cron):
--   SELECT cron.schedule('cleanup-sessions', '0 * * * *', $$ ... $$);

delete from public.sessions
where
  (phase in ('match_summary') and updated_at < now() - interval '24 hours')
  or (phase = 'lobby' and created_at < now() - interval '1 hour' and guest_id is null)
  or (phase in ('setup', 'letter_pick', 'round', 'round_result') and updated_at < now() - interval '6 hours');
