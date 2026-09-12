do $$
begin
  if to_regclass('public.student_cvs') is null then raise exception 'student_cvs missing'; end if;
  if to_regclass('public.applications') is null then raise exception 'applications missing'; end if;
  if to_regclass('public.application_status_history') is null then raise exception 'application_status_history missing'; end if;
  if not exists(select 1 from public.system_schema_versions where version='5.0') then raise exception 'Stage 5 schema version missing'; end if;
  if to_regprocedure('public.create_student_application(uuid,uuid,uuid,uuid)') is null then raise exception 'create_student_application missing'; end if;
  if to_regprocedure('public.set_primary_student_cv(uuid,uuid)') is null then raise exception 'set_primary_student_cv missing'; end if;
  if to_regprocedure('public.soft_delete_student_cv(uuid,uuid)') is null then raise exception 'soft_delete_student_cv missing'; end if;
  if not exists(select 1 from pg_indexes where schemaname='public' and tablename='student_cvs' and indexname='student_cvs_one_primary_uidx') then raise exception 'primary CV unique index missing'; end if;
  if not exists(select 1 from pg_constraint where conrelid='public.applications'::regclass and conname='applications_job_student_unique') then raise exception 'application unique constraint missing'; end if;
  if exists(select 1 from pg_policies where schemaname='public' and tablename in ('student_cvs','applications','application_status_history') and cmd in ('INSERT','UPDATE','DELETE')) then raise exception 'Stage 5 browser mutation policy detected'; end if;
  raise notice 'STAGE 5 STUDENT/CV/APPLY STRUCTURE: PASS';
end $$;
