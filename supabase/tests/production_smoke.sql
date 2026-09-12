do $$
declare
    v_schema_version text;
begin


    -- --------------------------------------------------------
    -- SCHEMA VERSION
    -- --------------------------------------------------------

    select version
    into v_schema_version

    from public.system_schema_versions

    order by
        applied_at desc

    limit 1;


    if v_schema_version <>
       '17.0'
    then

        raise exception
        'Expected schema version 17.0, found %',
        v_schema_version;

    end if;


    -- --------------------------------------------------------
    -- REQUIRED ROLES
    -- --------------------------------------------------------

    if (
        select count(*)

        from public.roles

        where name in (
            'super_admin',
            'admin',
            'placement_hr',
            'client_hr',
            'student'
        )
    ) < 5 then

        raise exception
        'Required roles missing';

    end if;


    -- --------------------------------------------------------
    -- STORAGE PRIVACY
    -- --------------------------------------------------------

    if exists (

        select 1

        from storage.buckets

        where id in (
            'student-cvs',
            'offer-letters'
        )

        and public =
            true

    ) then

        raise exception
        'Sensitive storage bucket is public';

    end if;


    -- --------------------------------------------------------
    -- TRANSITION MATRIX
    -- --------------------------------------------------------

    if not exists (

        select 1

        from public.application_state_transitions

        where from_status =
              'offer_accepted'

          and to_status =
              'placed'

    ) then

        raise exception
        'Accepted-offer placement transition missing';

    end if;


    -- --------------------------------------------------------
    -- REALTIME
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
        'Realtime notifications not enabled';

    end if;


    raise notice
    'Production smoke database checks passed';

end;
$$;
