-- ============================================================
-- SECURITY AUDIT
-- ============================================================

-- RLS disabled core tables
select
    schemaname,
    tablename,
    rowsecurity

from pg_tables

where schemaname =
      'public'

  and tablename in (
      'profiles',
      'student_profiles',
      'student_cvs',
      'jobs',
      'applications',
      'submissions',
      'submission_candidates',
      'mock_interviews',
      'interviews',
      'interview_feedbacks',
      'offers',
      'placements',
      'notifications'
  )

  and rowsecurity =
      false;


-- Publicly accessible SECURITY DEFINER functions
select
    n.nspname
        as schema_name,

    p.proname
        as function_name,

    pg_get_function_identity_arguments(
        p.oid
    )
        as arguments

from pg_proc p

join pg_namespace n
  on n.oid =
     p.pronamespace

where n.nspname =
      'public'

  and p.prosecdef =
      true

  and has_function_privilege(
      'anon',
      p.oid,
      'EXECUTE'
  );


-- Public storage buckets
select
    id,
    name,
    public

from storage.buckets

where id in (
    'student-cvs',
    'offer-letters',
    'system-exports'
)

and public =
    true;