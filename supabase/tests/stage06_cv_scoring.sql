do $$ begin
  if to_regclass('public.parsed_cv_profiles') is null then raise exception 'parsed_cv_profiles missing'; end if;
  if to_regclass('public.application_scores') is null then raise exception 'application_scores missing'; end if;
  if to_regclass('public.application_requirement_matches') is null then raise exception 'application_requirement_matches missing'; end if;
  if to_regclass('public.application_scoring_runs') is null then raise exception 'application_scoring_runs missing'; end if;
  if not exists(select 1 from public.system_schema_versions where version='6.0') then raise exception 'Stage 6 schema version missing'; end if;
  if to_regprocedure('public.begin_application_scoring(uuid,uuid)') is null then raise exception 'begin_application_scoring missing'; end if;
  if to_regprocedure('public.complete_application_scoring(uuid,uuid,uuid,uuid,jsonb,jsonb,text,jsonb)') is null then raise exception 'complete_application_scoring missing'; end if;
  if to_regprocedure('public.fail_application_scoring(uuid,uuid,uuid,text)') is null then raise exception 'fail_application_scoring missing'; end if;
  if has_function_privilege('authenticated','public.begin_application_scoring(uuid,uuid)','EXECUTE') then raise exception 'authenticated must not execute begin_application_scoring'; end if;
  if has_function_privilege('authenticated','public.complete_application_scoring(uuid,uuid,uuid,uuid,jsonb,jsonb,text,jsonb)','EXECUTE') then raise exception 'authenticated must not execute complete_application_scoring'; end if;
  if has_function_privilege('authenticated','public.fail_application_scoring(uuid,uuid,uuid,text)','EXECUTE') then raise exception 'authenticated must not execute fail_application_scoring'; end if;
  if not has_function_privilege('service_role','public.begin_application_scoring(uuid,uuid)','EXECUTE') then raise exception 'service_role needs begin_application_scoring'; end if;
  raise notice 'STAGE 6 CV/SCORING STRUCTURE: PASS';
end $$;
