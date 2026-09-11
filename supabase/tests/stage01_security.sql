-- ============================================================
-- STAGE 01 SECURITY AUDIT
-- ============================================================


-- Sensitive buckets must never be public.

select
    id,
    public

from storage.buckets

where id in (
    'student-cvs',
    'offer-letters',
    'system-exports'
)

and public = true;


-- No core Stage 1 table should have RLS disabled.

select
    tablename

from pg_tables

where schemaname =
      'public'

and tablename in (
    'profiles',
    'roles',
    'permissions',
    'role_permissions',
    'user_roles',
    'companies',
    'client_hr_profiles',
    'placement_hr_profiles',
    'student_profiles',
    'audit_logs'
)

and rowsecurity = false;


-- Verify no anonymous direct policy exists for sensitive
-- foundational tables.

select
    tablename,
    policyname,
    roles,
    cmd

from pg_policies

where schemaname =
      'public'

and tablename in (
    'profiles',
    'user_roles',
    'companies',
    'client_hr_profiles',
    'placement_hr_profiles',
    'student_profiles',
    'audit_logs'
)

and (
    'anon' = any(roles)
    or 'public' = any(roles)
);


-- Verify no public CV/offer object read policy.

select
    policyname,
    cmd,
    roles

from pg_policies

where schemaname =
      'storage'

and tablename =
      'objects'

and (
    lower(policyname)
        like '%cv%'
    or
    lower(policyname)
        like '%offer%'
);