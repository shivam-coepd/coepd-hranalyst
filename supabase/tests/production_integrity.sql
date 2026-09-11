-- ============================================================
-- HRANALYST PRODUCTION INTEGRITY TEST
-- ============================================================

do $$
declare
    v_count integer;
begin

    -- --------------------------------------------------------
    -- REQUIRED TABLES
    -- --------------------------------------------------------

    select count(*)
    into v_count

    from information_schema.tables

    where table_schema =
          'public'

      and table_name in (

          'profiles',
          'roles',
          'permissions',
          'user_roles',

          'companies',
          'client_hr_profiles',
          'placement_hr_profiles',

          'student_profiles',
          'student_cvs',

          'jobs',
          'job_checklists',

          'applications',
          'application_scores',
          'application_verifications',

          'submissions',
          'submission_candidates',

          'mock_interviews',
          'mock_scorecards',

          'interviews',
          'interview_feedbacks',

          'offers',
          'placements',

          'notifications',
          'notification_outbox',

          'audit_logs'
      );

    if v_count <> 25 then

        raise exception
        'Required table integrity check failed. Found % tables.',
        v_count;

    end if;


    -- --------------------------------------------------------
    -- COMPANY CANONICAL NAME
    -- --------------------------------------------------------

    if not exists (

        select 1

        from information_schema.columns

        where table_schema =
              'public'

          and table_name =
              'companies'

          and column_name =
              'name'

    ) then

        raise exception
        'companies.name missing';

    end if;


    -- --------------------------------------------------------
    -- VERIFIED SCORES
    -- --------------------------------------------------------

    if not exists (

        select 1

        from information_schema.columns

        where table_schema =
              'public'

          and table_name =
              'applications'

          and column_name =
              'verified_match_score'

    ) then

        raise exception
        'applications.verified_match_score missing';

    end if;


    -- --------------------------------------------------------
    -- PRIVATE CV BUCKET
    -- --------------------------------------------------------

    if exists (

        select 1

        from storage.buckets

        where id =
              'student-cvs'

          and public =
              true

    ) then

        raise exception
        'student-cvs bucket must be private';

    end if;


    -- --------------------------------------------------------
    -- PRIVATE OFFER BUCKET
    -- --------------------------------------------------------

    if exists (

        select 1

        from storage.buckets

        where id =
              'offer-letters'

          and public =
              true

    ) then

        raise exception
        'offer-letters bucket must be private';

    end if;


    -- --------------------------------------------------------
    -- NO CLIENT DIRECT APPLICATION POLICY
    -- --------------------------------------------------------

    if exists (

        select 1

        from pg_policies

        where schemaname =
              'public'

          and tablename =
              'applications'

          and lower(policyname)
              like
              '%client%'

    ) then

        raise exception
        'Client HR must not directly access applications table';

    end if;


    -- --------------------------------------------------------
    -- NOTIFICATION REALTIME
    -- --------------------------------------------------------

    if not exists (

        select 1

        from pg_publication_tables

        where pubname =
              'supabase_realtime'

          and schemaname =
              'public'

          and tablename =
              'notifications'

    ) then

        raise exception
        'notifications table is not enabled for Supabase Realtime';

    end if;


    -- --------------------------------------------------------
    -- STATE MATRIX
    -- --------------------------------------------------------

    select count(*)
    into v_count

    from public.application_state_transitions;

    if v_count < 20 then

        raise exception
        'Application transition matrix appears incomplete';

    end if;


    -- --------------------------------------------------------
    -- SCHEMA VERSION
    -- --------------------------------------------------------

    if not exists (

        select 1

        from public.system_schema_versions

        where version =
              '13.0'

    ) then

        raise exception
        'Stage 13 schema version missing';

    end if;


    raise notice
    'HRAnalyst production integrity checks passed';

end;
$$;