begin;


-- Inspect active canonical scoring runs. The partial unique index prevents two
-- workers from processing the same application concurrently.

select
    count(*)

from public.application_scoring_runs

where status =
      'processing';


-- Inspect any jobs stuck in processing.

select
    id,
    application_id,
    started_at,

    now()
      -
    started_at
      as processing_duration

from public.application_scoring_runs

where status =
      'processing'

order by
    started_at;

do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname='public'
      and tablename='application_scoring_runs'
      and indexname='application_scoring_one_processing_uidx'
      and indexdef ilike '%where (status = ''processing''%'
  ) then
    raise exception 'Missing one-processing-run concurrency index';
  end if;
end;
$$;


rollback;
