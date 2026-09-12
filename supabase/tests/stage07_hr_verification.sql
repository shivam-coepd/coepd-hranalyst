do $$
begin
  if to_regclass('public.verification_assignments') is null then raise exception 'verification_assignments missing'; end if;
  if to_regclass('public.application_verifications') is null then raise exception 'application_verifications missing'; end if;
  if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='applications' and column_name='verified_match_score') then raise exception 'applications.verified_match_score missing'; end if;
  if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='applications' and column_name='verified_ats_score') then raise exception 'applications.verified_ats_score missing'; end if;
  if to_regprocedure('public.claim_application_verification(uuid)') is null then raise exception 'claim RPC missing'; end if;
  if to_regprocedure('public.release_application_verification(uuid)') is null then raise exception 'release RPC missing'; end if;
  if to_regprocedure('public.finalize_application_verification(uuid,character varying,numeric,numeric,boolean,boolean,boolean,boolean,text,text,text)') is null then raise exception 'finalize RPC missing'; end if;
  if not exists(select 1 from public.system_schema_versions where version='7.0') then raise exception 'schema version 7.0 missing'; end if;
  if not exists(select 1 from pg_indexes where schemaname='public' and indexname='verification_assignments_one_active_uidx') then raise exception 'active assignment uniqueness missing'; end if;
  raise notice 'STAGE 7 HR VERIFICATION STRUCTURE: PASS';
end $$;
