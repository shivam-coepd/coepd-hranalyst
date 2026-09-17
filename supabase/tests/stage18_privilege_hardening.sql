do $$
begin
  if exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'anon'
  ) then
    raise exception 'Anonymous role retains public-schema table privileges';
  end if;

  if exists (
    select 1 from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'authenticated'
      and privilege_type in ('INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER')
  ) then
    raise exception 'Authenticated role retains direct public-schema mutation privileges';
  end if;

  if exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('v','m')
      and has_table_privilege('authenticated', c.oid, 'SELECT')
  ) then
    raise exception 'Authenticated role can directly select a privileged view';
  end if;

  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and has_function_privilege('anon', p.oid, 'EXECUTE')
  ) then
    raise exception 'Anonymous role can execute a public-schema function';
  end if;

  if not has_function_privilege('authenticated', 'public.current_user_roles()', 'EXECUTE')
     or not has_function_privilege('authenticated', 'public.claim_application_verification(uuid)', 'EXECUTE')
     or not has_function_privilege('authenticated', 'public.create_client_submission(uuid,uuid[],text)', 'EXECUTE')
     or not has_function_privilege('authenticated', 'public.student_decide_offer(uuid,character varying,text)', 'EXECUTE') then
    raise exception 'Required authenticated RPC execution grant is missing';
  end if;

  if not exists (select 1 from public.system_schema_versions where version = '18.0') then
    raise exception 'Schema version 18.0 missing';
  end if;
end;
$$;
