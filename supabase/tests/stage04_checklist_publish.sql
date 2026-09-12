do $$
declare n integer;
begin
  select count(*) into n from information_schema.tables
  where table_schema='public' and table_name in ('job_checklists','ai_generation_runs','job_publications','notification_outbox');
  if n <> 4 then raise exception 'Stage 4 tables missing: expected 4, found %',n; end if;

  if not exists(select 1 from public.system_schema_versions where version='4.0') then
    raise exception 'Stage 4 schema version missing';
  end if;

  if not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='save_generated_job_checklist') then
    raise exception 'save_generated_job_checklist missing';
  end if;
  if not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='approve_job_checklist' and pg_get_function_identity_arguments(p.oid)='p_checklist_id uuid, p_actor_id uuid') then
    raise exception 'Stage 4 approve_job_checklist(uuid,uuid) missing';
  end if;
  if not exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='publish_job_stage4') then
    raise exception 'publish_job_stage4 missing';
  end if;

  select count(*) into n from pg_class c join pg_namespace ns on ns.oid=c.relnamespace
  where ns.nspname='public' and c.relname in ('job_checklists','ai_generation_runs','job_publications','notification_outbox') and c.relrowsecurity=false;
  if n <> 0 then raise exception 'One or more Stage 4 tables do not have RLS enabled'; end if;

  select count(*) into n from pg_policies
  where schemaname='public'
    and tablename in ('job_checklists','ai_generation_runs','job_publications','notification_outbox')
    and cmd in ('INSERT','UPDATE','DELETE','ALL');
  if n <> 0 then raise exception 'Stage 4 browser mutation policies detected: %',n; end if;

  if exists(select 1 from pg_policies where schemaname='public' and tablename='notification_outbox') then
    raise exception 'notification_outbox must not expose browser policies in Stage 4';
  end if;

  if not exists(select 1 from pg_indexes where schemaname='public' and indexname='job_checklists_one_approved_idx') then
    raise exception 'Approved checklist uniqueness index missing';
  end if;
  if not exists(select 1 from pg_indexes where schemaname='public' and indexname='notification_outbox_dedupe_idx') then
    raise exception 'Notification dedupe index missing';
  end if;

  raise notice 'STAGE 4 CHECKLIST/PUBLISH STRUCTURE: PASS';
end $$;
