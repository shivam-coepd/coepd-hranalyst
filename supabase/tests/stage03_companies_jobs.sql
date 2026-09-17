do $$ declare c int; begin
select count(*) into c from information_schema.columns where table_schema='public' and table_name='companies' and column_name in ('name','domain','website','size','logo'); if c<>5 then raise exception 'Canonical company columns incomplete'; end if;
if exists(select 1 from information_schema.columns where table_schema='public' and table_name='companies' and column_name in ('company_name','company_domain','website_url','company_size','logo_url')) then raise exception 'Legacy company columns still present'; end if;
if not exists(select 1 from information_schema.tables where table_schema='public' and table_name='jobs') then raise exception 'jobs missing'; end if;
if not exists(select 1 from information_schema.tables where table_schema='public' and table_name='job_status_history') then raise exception 'job_status_history missing'; end if;
if not exists(select 1 from public.system_schema_versions where version='3.0') then raise exception 'Stage 3 schema version missing'; end if;
raise notice 'STAGE 3 STRUCTURE: PASS'; end $$;
