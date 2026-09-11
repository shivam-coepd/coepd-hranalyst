-- ============================================================
-- STAGE 02 AUTH / RBAC INTEGRITY TEST
-- Run after Stage 01 + Stage 02 migrations.
-- Unsafe-result queries must return 0 rows.
-- ============================================================

do $$
begin
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'current_user_roles'
  ) then
    raise exception 'current_user_roles() is missing';
  end if;

  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'has_role'
  ) then
    raise exception 'has_role(text) is missing';
  end if;

  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_admin'
  ) then
    raise exception 'is_admin() is missing';
  end if;

  if not exists (
    select 1 from public.system_schema_versions where version = '2.0'
  ) then
    raise exception 'Stage 2 schema version missing';
  end if;

  raise notice 'STAGE 2 AUTH/RBAC STRUCTURE: PASS';
end;
$$;

-- Browser roles must not have direct mutation privileges on critical auth tables.
select table_schema, table_name, privilege_type
from information_schema.role_table_grants
where grantee in ('anon', 'authenticated')
  and table_schema = 'public'
  and table_name in ('profiles', 'user_roles', 'audit_logs')
  and privilege_type in ('INSERT', 'UPDATE', 'DELETE');

-- Core Stage 2 tables must have RLS enabled.
select tablename
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles','roles','permissions','role_permissions','user_roles',
    'companies','company_status_history','client_hr_profiles',
    'placement_hr_profiles','student_profiles','audit_logs'
  )
  and rowsecurity = false;

-- No anonymous read policy should exist for identity/role/audit tables.
select tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles','user_roles','student_profiles','client_hr_profiles','placement_hr_profiles','audit_logs')
  and ('anon' = any(roles) or 'public' = any(roles));
