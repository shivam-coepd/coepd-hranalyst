begin;


-- ============================================================
-- HRANALYST STAGE 15
-- PRODUCTION RELEASE
-- ============================================================


-- ------------------------------------------------------------
-- 1. RELEASE METADATA
-- ------------------------------------------------------------

create table if not exists
public.system_releases (

    id uuid primary key
        default gen_random_uuid(),

    release_version varchar(50)
        not null unique,

    schema_version varchar(50)
        not null,

    release_name varchar(255)
        not null,

    status varchar(30)
        not null
        check (
            status in (
                'deployed',
                'rolled_back',
                'superseded'
            )
        ),

    deployed_at timestamptz
        not null default now(),

    deployed_by uuid
        references public.profiles(id),

    git_commit varchar(100),

    release_notes text
);


-- ------------------------------------------------------------
-- 2. RELEASE HEALTH EVENTS
-- ------------------------------------------------------------

create table if not exists
public.release_health_events (

    id uuid primary key
        default gen_random_uuid(),

    release_id uuid not null
        references public.system_releases(id)
        on delete cascade,

    check_type varchar(100)
        not null,

    status varchar(30)
        not null
        check (
            status in (
                'pass',
                'fail',
                'warning'
            )
        ),

    details jsonb
        not null
        default '{}'::jsonb,

    checked_at timestamptz
        not null
        default now()
);


create index if not exists
release_health_events_release_idx
on public.release_health_events(
    release_id,
    checked_at desc
);


-- ------------------------------------------------------------
-- 3. UAT RUNS
-- ------------------------------------------------------------

create table if not exists
public.uat_runs (

    id uuid primary key
        default gen_random_uuid(),

    run_code varchar(100)
        not null unique,

    environment varchar(30)
        not null
        check (
            environment in (
                'staging',
                'production_smoke'
            )
        ),

    release_version varchar(50)
        not null,

    started_at timestamptz
        not null default now(),

    completed_at timestamptz,

    status varchar(30)
        not null default 'running'
        check (
            status in (
                'running',
                'passed',
                'failed',
                'cancelled'
            )
        ),

    executed_by uuid
        references public.profiles(id),

    total_tests integer
        not null default 0,

    passed_tests integer
        not null default 0,

    failed_tests integer
        not null default 0,

    notes text
);


-- ------------------------------------------------------------
-- 4. UAT TEST RESULTS
-- ------------------------------------------------------------

create table if not exists
public.uat_test_results (

    id uuid primary key
        default gen_random_uuid(),

    uat_run_id uuid not null
        references public.uat_runs(id)
        on delete cascade,

    test_code varchar(100)
        not null,

    area varchar(100)
        not null,

    actor_role varchar(50),

    description text
        not null,

    expected_result text
        not null,

    actual_result text,

    status varchar(30)
        not null
        check (
            status in (
                'passed',
                'failed',
                'blocked',
                'not_run'
            )
        ),

    evidence text,

    executed_at timestamptz
        not null default now(),

    unique(
        uat_run_id,
        test_code
    )
);


create index if not exists
uat_test_results_run_status_idx
on public.uat_test_results(
    uat_run_id,
    status
);


-- ------------------------------------------------------------
-- 5. DEPLOYMENT AUDIT
-- ------------------------------------------------------------

create table if not exists
public.deployment_audit_logs (

    id bigint
        generated always
        as identity
        primary key,

    release_version varchar(50)
        not null,

    environment varchar(30)
        not null,

    event varchar(100)
        not null,

    status varchar(30)
        not null,

    metadata jsonb
        not null
        default '{}'::jsonb,

    created_at timestamptz
        not null default now()
);


-- ------------------------------------------------------------
-- 6. SECURITY
-- ------------------------------------------------------------

alter table public.system_releases
enable row level security;

alter table public.release_health_events
enable row level security;

alter table public.uat_runs
enable row level security;

alter table public.uat_test_results
enable row level security;

alter table public.deployment_audit_logs
enable row level security;


drop policy if exists
"Admin views releases"
on public.system_releases;

create policy
"Admin views releases"

on public.system_releases

for select

to authenticated

using (
    public.is_admin()
);


drop policy if exists
"Admin views release health"
on public.release_health_events;

create policy
"Admin views release health"

on public.release_health_events

for select

to authenticated

using (
    public.is_admin()
);


drop policy if exists
"Admin views UAT runs"
on public.uat_runs;

create policy
"Admin views UAT runs"

on public.uat_runs

for select

to authenticated

using (
    public.is_admin()
);


drop policy if exists
"Admin views UAT results"
on public.uat_test_results;

create policy
"Admin views UAT results"

on public.uat_test_results

for select

to authenticated

using (
    public.is_admin()
);


drop policy if exists
"Super Admin views deployment logs"
on public.deployment_audit_logs;

create policy
"Super Admin views deployment logs"

on public.deployment_audit_logs

for select

to authenticated

using (
    public.has_role(
        'super_admin'
    )
);


-- ------------------------------------------------------------
-- 7. RELEASE VERSION
-- ------------------------------------------------------------

insert into
public.system_schema_versions (
    version,
    description
)
values (
    '15.0',
    'Production UAT and deployment release infrastructure'
)
on conflict (
    version
)
do nothing;


commit;