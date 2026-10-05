
DROP FUNCTION IF EXISTS public.recover_stuck_notifications();
DROP FUNCTION IF EXISTS public.claim_notification_outbox(int);
DROP FUNCTION IF EXISTS public.finish_notification_attempt(uuid, int, text);
CREATE OR REPLACE FUNCTION public.claim_notification_outbox(p_limit int)
RETURNS TABLE (
  id uuid,
  attempts int,
  event_type varchar,
  channel varchar,
  recipient_user_id uuid,
  recipient_email varchar,
  entity_type varchar,
  entity_id uuid,
  payload jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH claimed AS (
    SELECT o.id
    FROM public.notification_outbox o
    WHERE o.status = 'pending'
      AND o.scheduled_for <= now()
      AND o.attempts < o.max_attempts
    ORDER BY o.scheduled_for ASC
    FOR UPDATE SKIP LOCKED
    LIMIT p_limit
  )
  UPDATE public.notification_outbox u
  SET status = 'processing',
      processing_started_at = now(),
      attempts = u.attempts + 1,
      updated_at = now()
  FROM claimed c
  WHERE u.id = c.id
  RETURNING 
    u.id, 
    u.attempts, 
    u.event_type, 
    u.channel, 
    u.recipient_user_id, 
    u.recipient_email, 
    u.entity_type, 
    u.entity_id, 
    u.payload;
END;
$$;

CREATE OR REPLACE FUNCTION public.finish_notification_attempt(
  p_outbox_id uuid,
  p_attempt int,
  p_error text DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max_attempts int;
  v_current_status text;
BEGIN
  SELECT max_attempts, status INTO v_max_attempts, v_current_status
  FROM public.notification_outbox
  WHERE id = p_outbox_id AND attempts = p_attempt FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF v_current_status <> 'processing' THEN
    RETURN false;
  END IF;

  IF p_error IS NULL THEN
    -- Success
    UPDATE public.notification_outbox
    SET status = 'sent',
        sent_at = now(),
        error_message = NULL,
        processing_started_at = NULL,
        updated_at = now()
    WHERE id = p_outbox_id;
  ELSE
    -- Failure
    IF p_attempt >= v_max_attempts THEN
      UPDATE public.notification_outbox
      SET status = 'dead_letter',
          error_message = p_error,
          failed_at = now(),
          processing_started_at = NULL,
          updated_at = now()
      WHERE id = p_outbox_id;
    ELSE
      -- Retryable
      UPDATE public.notification_outbox
      SET status = 'pending',
          error_message = p_error,
          scheduled_for = now() + (interval '1 minute' * power(2, p_attempt)),
          processing_started_at = NULL,
          updated_at = now()
      WHERE id = p_outbox_id;
    END IF;
  END IF;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.recover_stuck_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notification_outbox
  SET status = 'pending',
      processing_started_at = NULL,
      updated_at = now()
  WHERE status = 'processing'
    AND processing_started_at < now() - interval '10 minutes';
END;
$$;
