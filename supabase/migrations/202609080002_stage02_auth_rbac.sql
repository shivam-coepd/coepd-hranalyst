-- ============================================================
-- HRANALYST PLACEMENT WING
-- STAGE 02 - AUTHENTICATION, RBAC, ACCOUNT ACCESS
-- Requires: 202609080001_stage01_foundation.sql
-- ============================================================

begin;

-- Later permission upserts target the canonical code column. The foundation's
-- lower(code) index alone cannot arbitrate ON CONFLICT (code).
create unique index if not exists permissions_code_exact_uidx on public.permissions(code);

create table if not exists public.company_status_history (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  old_status varchar(30), new_status varchar(30) not null, reason text,
  changed_by uuid references public.profiles(id),
  changed_at timestamptz not null default now()
);
create index if not exists company_status_history_company_idx
  on public.company_status_history(company_id, changed_at desc);

-- ------------------------------------------------------------
-- 0. ACCOUNT STATUS AUDIT FIELDS
-- ------------------------------------------------------------

alter table public.profiles add column if not exists suspended_at timestamptz;
alter table public.profiles add column if not exists suspended_by uuid references public.profiles(id);
alter table public.profiles add column if not exists suspension_reason text;
alter table public.profiles add column if not exists inactive_at timestamptz;
alter table public.profiles add column if not exists inactive_by uuid references public.profiles(id);
alter table public.profiles add column if not exists inactivation_reason text;

-- ------------------------------------------------------------
-- 1. CURRENT USER ROLE HELPERS
-- ------------------------------------------------------------

create or replace function public.current_user_roles()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(r.name order by r.name), array[]::text[])
  from public.user_roles ur
  join public.roles r on r.id = ur.role_id
  where ur.user_id = auth.uid();
$$;

create or replace function public.has_role(requested_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.name = requested_role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('super_admin') or public.has_role('admin');
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('super_admin');
$$;

revoke all on function public.current_user_roles() from public;
revoke all on function public.has_role(text) from public;
revoke all on function public.is_admin() from public;
revoke all on function public.is_super_admin() from public;

grant execute on function public.current_user_roles() to authenticated;
grant execute on function public.has_role(text) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_super_admin() to authenticated;

-- ------------------------------------------------------------
-- 1B. FOUNDATION PERMISSION CATALOG
-- ------------------------------------------------------------

insert into public.permissions(code, name, description)
values
  ('users.read', 'Read Users', 'Read user records.'),
  ('users.create', 'Create Users', 'Create application users.'),
  ('users.approve', 'Approve Users', 'Approve, reject, suspend or inactivate users.'),
  ('roles.read', 'Read Roles', 'Read the system role catalog.'),
  ('companies.read', 'Read Companies', 'Read company records.'),
  ('companies.manage', 'Manage Companies', 'Create and update company records.'),
  ('profile.read.own', 'Read Own Profile', 'Read the current user profile.'),
  ('profile.update.own', 'Update Own Profile', 'Update permitted own-profile fields.')
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description;

-- Super Admin receives every foundational permission.
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.name = 'super_admin'
on conflict do nothing;

-- Admin receives operational user/company permissions.
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in (
  'users.read','users.create','users.approve','roles.read',
  'companies.read','companies.manage','profile.read.own','profile.update.own'
)
where r.name = 'admin'
on conflict do nothing;

-- Other roles receive foundational self/company-read permissions only.
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in ('companies.read','profile.read.own','profile.update.own')
where r.name in ('placement_hr','client_hr')
on conflict do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in ('profile.read.own','profile.update.own')
where r.name = 'student'
on conflict do nothing;

-- ------------------------------------------------------------
-- 2. PROFILE POLICIES
-- ------------------------------------------------------------

drop policy if exists profile_self_read on public.profiles;
drop policy if exists profiles_self_read on public.profiles;
drop policy if exists profiles_select_self_or_admin on public.profiles;
create policy profiles_select_self_or_admin
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
);

-- No direct browser UPDATE policy is intentionally created for profiles.
-- Account status/approval is modified only by trusted server-side code.

-- ------------------------------------------------------------
-- 3. ROLE CATALOG / ASSIGNMENTS
-- ------------------------------------------------------------

drop policy if exists authenticated_read_roles on public.roles;
drop policy if exists roles_authenticated_read on public.roles;
create policy roles_authenticated_read
on public.roles
for select
to authenticated
using (true);


drop policy if exists authenticated_read_permissions on public.permissions;
drop policy if exists permissions_authenticated_read on public.permissions;
create policy permissions_authenticated_read
on public.permissions
for select
to authenticated
using (true);


drop policy if exists role_permissions_authenticated_read on public.role_permissions;
create policy role_permissions_authenticated_read
on public.role_permissions
for select
to authenticated
using (true);


drop policy if exists user_roles_self_or_admin_read on public.user_roles;
create policy user_roles_self_or_admin_read
on public.user_roles
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

-- ------------------------------------------------------------
-- 4. SPECIALIZED PROFILE POLICIES
-- ------------------------------------------------------------

drop policy if exists student_profile_self_read on public.student_profiles;
drop policy if exists student_profiles_self_read on public.student_profiles;
drop policy if exists student_profiles_self_or_admin_read on public.student_profiles;
create policy student_profiles_self_or_admin_read
on public.student_profiles
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);


drop policy if exists placement_hr_self_read on public.placement_hr_profiles;
drop policy if exists placement_hr_profiles_self_read on public.placement_hr_profiles;
drop policy if exists placement_hr_profiles_self_or_admin_read on public.placement_hr_profiles;
create policy placement_hr_profiles_self_or_admin_read
on public.placement_hr_profiles
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);


drop policy if exists client_hr_self_read on public.client_hr_profiles;
drop policy if exists client_hr_profiles_self_read on public.client_hr_profiles;
drop policy if exists client_hr_profiles_self_or_admin_read on public.client_hr_profiles;
create policy client_hr_profiles_self_or_admin_read
on public.client_hr_profiles
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

-- ------------------------------------------------------------
-- 5. COMPANY READ FOR ADMIN / LINKED CLIENT HR
-- ------------------------------------------------------------

drop policy if exists companies_admin_or_linked_client_read on public.companies;
create policy companies_admin_or_linked_client_read
on public.companies
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.client_hr_profiles chp
    where chp.user_id = auth.uid()
      and chp.company_id = companies.id
      and chp.is_active = true
  )
);

-- ------------------------------------------------------------
-- 6. COMPANY STATUS HISTORY / AUDIT LOG READ
-- ------------------------------------------------------------

alter table public.company_status_history enable row level security;

drop policy if exists company_status_history_admin_read on public.company_status_history;
create policy company_status_history_admin_read
on public.company_status_history
for select
to authenticated
using (public.is_admin());


drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_admin_read
on public.audit_logs
for select
to authenticated
using (public.is_admin());

-- ------------------------------------------------------------
-- 7. EXPLICIT TABLE PRIVILEGES
-- Browser roles are read-only for foundational identity/RBAC tables.
-- Later feature stages may add narrowly-scoped privileges with RLS.
-- ------------------------------------------------------------

revoke insert, update, delete on public.profiles from anon, authenticated;
revoke insert, update, delete on public.roles from anon, authenticated;
revoke insert, update, delete on public.permissions from anon, authenticated;
revoke insert, update, delete on public.role_permissions from anon, authenticated;
revoke insert, update, delete on public.user_roles from anon, authenticated;
revoke insert, update, delete on public.companies from anon, authenticated;
revoke insert, update, delete on public.company_status_history from anon, authenticated;
revoke insert, update, delete on public.client_hr_profiles from anon, authenticated;
revoke insert, update, delete on public.placement_hr_profiles from anon, authenticated;
revoke insert, update, delete on public.student_profiles from anon, authenticated;
revoke insert, update, delete on public.audit_logs from anon, authenticated;

-- ------------------------------------------------------------
-- 7B. READ PRIVILEGES
-- ------------------------------------------------------------

grant select on public.profiles to authenticated;
grant select on public.roles to authenticated;
grant select on public.permissions to authenticated;
grant select on public.role_permissions to authenticated;
grant select on public.user_roles to authenticated;
grant select on public.companies to authenticated;
grant select on public.company_status_history to authenticated;
grant select on public.client_hr_profiles to authenticated;
grant select on public.placement_hr_profiles to authenticated;
grant select on public.student_profiles to authenticated;
grant select on public.audit_logs to authenticated;

-- Do not grant INSERT/UPDATE/DELETE on role assignments, approvals or audit logs
-- to browser roles. Trusted mutations use the service-role server client.

-- ------------------------------------------------------------
-- 8. SCHEMA VERSION
-- ------------------------------------------------------------

insert into public.system_schema_versions(version, description)
values ('2.0', 'Authentication, RBAC helpers, account access and foundational RLS')
on conflict (version) do update
set description = excluded.description,
    applied_at = now();

commit;
