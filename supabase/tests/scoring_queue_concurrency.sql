begin;


-- Inspect number currently available for scoring.

select
    count(*)

from public.application_processing_jobs

where status =
      'pending';


-- Inspect any jobs stuck in processing.

select
    id,
    application_id,
    started_at,

    now()
      -
    started_at
      as processing_duration

from public.application_processing_jobs

where status =
      'processing'

order by
    started_at;


rollback;