-- ============================================================
-- STAGE 01 INTEGRITY
-- ============================================================

do $$
declare
    v_count integer;
begin

    -- --------------------------------------------------------
    -- FOUNDATIONAL TABLES
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
          'role_permissions',
          'user_roles',
          'companies',
          'client_hr_profiles',
          'placement_hr_profiles',
          'student_profiles',
          'audit_logs',
          'system_schema_versions'
      );


    if v_count <> 11 then

        raise exception
        'Stage 1 table integrity failed. Expected 11, found %',
        v_count;

    end if;


    -- --------------------------------------------------------
    -- FIVE CORE ROLES
    -- --------------------------------------------------------

    select count(*)
    into v_count

    from public.roles

    where name in (
        'super_admin',
        'admin',
        'placement_hr',
        'client_hr',
        'student'
    );


    if v_count <> 5 then

        raise exception
        'Stage 1 role integrity failed. Expected 5 roles, found %',
        v_count;

    end if;


    -- --------------------------------------------------------
    -- CANONICAL COMPANY COLUMNS
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


    if not exists (

        select 1

        from information_schema.columns

        where table_schema =
              'public'

          and table_name =
              'companies'

          and column_name =
              'logo'

    ) then

        raise exception
        'companies.logo missing';

    end if;


    -- --------------------------------------------------------
    -- NO LEGACY COMPANY COLUMN NAMES
    -- --------------------------------------------------------

    if exists (

        select 1

        from information_schema.columns

        where table_schema =
              'public'

          and table_name =
              'companies'

          and column_name in (
              'company_name',
              'logo_url',
              'website_url',
              'company_domain'
          )

    ) then

        raise exception
        'Legacy companies column names detected';

    end if;


    -- --------------------------------------------------------
    -- STUDENT STRUCTURED LOCATION
    -- --------------------------------------------------------

    if (
        select count(*)

        from information_schema.columns

        where table_schema =
              'public'

          and table_name =
              'student_profiles'

          and column_name in (
              'location',
              'city',
              'state',
              'country'
          )
    ) <> 4 then

        raise exception
        'Student location columns incomplete';

    end if;


    -- --------------------------------------------------------
    -- USER ROLE AUDIT FIELDS
    -- --------------------------------------------------------

    if (
        select count(*)

        from information_schema.columns

        where table_schema =
              'public'

          and table_name =
              'user_roles'

          and column_name in (
              'assigned_by',
              'assigned_at'
          )
    ) <> 2 then

        raise exception
        'user_roles assignment audit fields missing';

    end if;


    -- --------------------------------------------------------
    -- PRIVATE STORAGE
    -- --------------------------------------------------------

    if exists (

        select 1

        from storage.buckets

        where id in (
            'student-cvs',
            'offer-letters',
            'system-exports'
        )

          and public =
              true

    ) then

        raise exception
        'Sensitive storage bucket is public';

    end if;


    -- --------------------------------------------------------
    -- AUTH TRIGGER
    -- --------------------------------------------------------

    if not exists (

        select 1

        from information_schema.triggers

        where trigger_name =
              'on_auth_user_created'

    ) then

        raise exception
        'Auth profile trigger missing';

    end if;


    -- --------------------------------------------------------
    -- RLS
    -- --------------------------------------------------------

    if exists (

        select 1

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

          and rowsecurity =
              false

    ) then

        raise exception
        'Stage 1 table found without RLS';

    end if;


    -- --------------------------------------------------------
    -- SCHEMA VERSION
    -- --------------------------------------------------------

    if not exists (

        select 1

        from public.system_schema_versions

        where version =
              '1.0'

    ) then

        raise exception
        'Stage 1 schema version missing';

    end if;


    raise notice
    'STAGE 1 INTEGRITY: PASS';

end;
$$;