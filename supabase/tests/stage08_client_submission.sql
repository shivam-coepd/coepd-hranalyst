do $$ begin
  if to_regclass('public.submissions') is null then raise exception 'submissions missing'; end if;
  if to_regclass('public.submission_candidates') is null then raise exception 'submission_candidates missing'; end if;
  if to_regprocedure('public.create_client_submission(uuid,uuid[],text)') is null then raise exception 'create_client_submission RPC missing'; end if;
  if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='applications' and column_name='submitted_to_client_at') then raise exception 'submitted_to_client_at missing'; end if;
  if not exists(select 1 from public.system_schema_versions where version='8.0') then raise exception 'schema version 8.0 missing'; end if;
  if has_table_privilege('anon','public.submissions','INSERT') or has_table_privilege('authenticated','public.submissions','INSERT') then raise exception 'direct submission inserts must be blocked'; end if;
  raise notice 'STAGE 8 CLIENT SUBMISSION STRUCTURE: PASS';
end $$;
