select
    status,
    count(*)

from public.notification_outbox

group by status

order by status;


select
    id,
    event_type,
    attempts,
    error_message,
    created_at

from public.notification_outbox

where status =
      'failed'

order by
    created_at desc;


select
    id,
    event_type,
    processing_started_at

from public.notification_outbox

where status =
      'processing'

  and processing_started_at <
      now()
      -
      interval '15 minutes';