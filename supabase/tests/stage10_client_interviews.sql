do $$
begin
  if to_regclass('public.client_candidate_decisions') is null then raise exception 'client_candidate_decisions missing'; end if;
  if to_regclass('public.client_candidate_decision_history') is null then raise exception 'client_candidate_decision_history missing'; end if;
  if to_regclass('public.interviews') is null then raise exception 'interviews missing'; end if;
  if to_regclass('public.interview_status_history') is null then raise exception 'interview_status_history missing'; end if;
  if to_regclass('public.interview_reschedules') is null then raise exception 'interview_reschedules missing'; end if;
  if to_regclass('public.interview_participants') is null then raise exception 'interview_participants missing'; end if;
  if not exists(select 1 from public.system_schema_versions where version='10.0') then raise exception 'schema version 10.0 missing'; end if;
  if to_regprocedure('public.client_decide_candidate(uuid,character varying,character varying,text)') is null then raise exception 'client_decide_candidate missing'; end if;
  if to_regprocedure('public.schedule_client_interview(uuid,character varying,character varying,timestamp with time zone,integer,character varying,character varying,character varying,text,text,text)') is null then raise exception 'schedule_client_interview signature missing'; end if;
  if to_regprocedure('public.reschedule_client_interview(uuid,timestamp with time zone,character varying,character varying,character varying,text,text,text)') is null then raise exception 'reschedule_client_interview missing'; end if;
  if to_regprocedure('public.cancel_client_interview(uuid,text)') is null then raise exception 'cancel_client_interview missing'; end if;
  if to_regprocedure('public.complete_client_interview(uuid)') is null then raise exception 'complete_client_interview missing'; end if;
  if not exists(select 1 from pg_indexes where schemaname='public' and indexname='interviews_active_round_idx') then raise exception 'active round index missing'; end if;
  if has_table_privilege('authenticated','public.interviews','INSERT') then raise exception 'authenticated must not directly insert interviews'; end if;
  if has_table_privilege('authenticated','public.client_candidate_decisions','UPDATE') then raise exception 'authenticated must not directly update decisions'; end if;
  raise notice 'STAGE 10 CLIENT INTERVIEWS STRUCTURE: PASS';
end $$;
