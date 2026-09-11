-- ============================================================
-- HRANALYST PLACEMENT WING
-- STAGE 13
-- SCHEMA + SECURITY CONSOLIDATION
-- ============================================================

begin;


-- ============================================================
-- 1. CANONICAL COMPANY SCHEMA
-- ============================================================

alter table public.companies
add column if not exists name varchar(255);

alter table public.companies
add column if not exists domain varchar(255);

alter table public.companies
add column if not exists website text;

alter table public.companies
add column if not exists size varchar(100);

alter table public.companies
add column if not exists logo text;

-- We intentionally keep canonical names:
--
-- companies.name
-- companies.domain
-- companies.website
-- companies.size
-- companies.logo
--
-- Do NOT introduce:
-- company_name
-- company_domain
-- website_url
-- company_size
-- logo_url


-- ============================================================
-- 2. STUDENT PROFILE CONSOLIDATION
-- ============================================================

alter table public.student_profiles
add column if not exists city varchar(150);

alter table public.student_profiles
add column if not exists state varchar(150);

alter table public.student_profiles
add column if not exists country varchar(150);

alter table public.student_profiles
add column if not exists postal_code varchar(30);

alter table public.student_profiles
add column if not exists updated_at timestamptz
not null default now();


-- ============================================================
-- 3. USER ROLE ASSIGNMENT CONSOLIDATION
-- ============================================================

alter table public.user_roles
add column if not exists assigned_by uuid
references public.profiles(id);

alter table public.user_roles
add column if not exists assigned_at timestamptz
not null default now();


-- ============================================================
-- 4. VERIFIED SCORE SEMANTICS
-- ============================================================

alter table public.applications
add column if not exists verified_match_score numeric(5,2);

alter table public.applications
add column if not exists verified_ats_score numeric(5,2);

alter table public.applications
drop constraint if exists
applications_verified_match_score_check;

alter table public.applications
add constraint applications_verified_match_score_check
check (
    verified_match_score is null
    or (
        verified_match_score >= 0
        and verified_match_score <= 100
    )
);

alter table public.applications
drop constraint if exists
applications_verified_ats_score_check;

alter table public.applications
add constraint applications_verified_ats_score_check
check (
    verified_ats_score is null
    or (
        verified_ats_score >= 0
        and verified_ats_score <= 100
    )
);


-- ============================================================
-- 5. EFFECTIVE SCORE VIEW
-- ============================================================

create or replace view
public.application_effective_scores
with (security_invoker = true)
as

select
    a.id as application_id,

    a.match_score
        as automated_match_score,

    a.verified_match_score,

    coalesce(
        a.verified_match_score,
        a.match_score
    ) as effective_match_score,

    a.ats_score
        as automated_ats_score,

    a.verified_ats_score,

    coalesce(
        a.verified_ats_score,
        a.ats_score
    ) as effective_ats_score

from public.applications a;


-- ============================================================
-- 6. FINAL APPLICATION STATUS CONSTRAINT
-- ============================================================

alter table public.applications
drop constraint if exists
applications_status_check;

alter table public.applications
add constraint applications_status_check
check (
    status in (

        'applied',

        'scoring_pending',
        'scoring',
        'scoring_failed',

        'verification_pending',
        'under_verification',
        'verified',
        'rejected_internal',
        'update_requested',

        'submitted_to_client',
        'client_review',

        'shortlisted',
        'rejected_client',

        'mock_pending',
        'mock_scheduled',
        'mock_completed',

        'interview_scheduled',
        'interview_completed',

        'selected',
        'on_hold',
        'rejected_interview',

        'offer_pending',
        'offer_received',

        'placed',

        'withdrawn'
    )
);


-- ============================================================
-- 7. APPLICATION STATE TRANSITION MATRIX
-- ============================================================

create table if not exists
public.application_state_transitions (

    from_status varchar(50)
        not null,

    to_status varchar(50)
        not null,

    description text,

    primary key (
        from_status,
        to_status
    )
);

truncate table
public.application_state_transitions;

insert into
public.application_state_transitions (
    from_status,
    to_status,
    description
)
values

('applied',
 'scoring_pending',
 'Application queued for scoring'),

('scoring_pending',
 'scoring',
 'Scoring worker claimed application'),

('scoring',
 'verification_pending',
 'Scoring completed'),

('scoring',
 'scoring_failed',
 'Scoring failed'),

('scoring_failed',
 'scoring_pending',
 'Scoring retry'),

('verification_pending',
 'under_verification',
 'Placement HR claimed verification'),

('under_verification',
 'verified',
 'CV verified'),

('under_verification',
 'rejected_internal',
 'Application rejected internally'),

('under_verification',
 'update_requested',
 'Student update requested'),

('update_requested',
 'scoring_pending',
 'Updated CV submitted for rescore'),

('verified',
 'submitted_to_client',
 'Candidate submitted to client'),

('submitted_to_client',
 'client_review',
 'Client opened candidate'),

('submitted_to_client',
 'shortlisted',
 'Client shortlisted candidate'),

('client_review',
 'shortlisted',
 'Client shortlisted candidate'),

('submitted_to_client',
 'rejected_client',
 'Client rejected candidate'),

('client_review',
 'rejected_client',
 'Client rejected candidate'),

('submitted_to_client',
 'mock_scheduled',
 'Mock scheduled after submission'),

('shortlisted',
 'mock_scheduled',
 'Mock scheduled for shortlisted candidate'),

('mock_scheduled',
 'mock_completed',
 'Mock completed'),

('mock_scheduled',
 'mock_pending',
 'Mock no-show/reschedule'),

('mock_pending',
 'mock_scheduled',
 'Mock rescheduled'),

('mock_completed',
 'shortlisted',
 'Client shortlist retained after mock'),

('shortlisted',
 'interview_scheduled',
 'Client interview scheduled'),

('mock_completed',
 'interview_scheduled',
 'Interview scheduled after mock'),

('interview_scheduled',
 'interview_completed',
 'Interview completed'),

('interview_scheduled',
 'shortlisted',
 'Interview cancelled'),

('interview_completed',
 'selected',
 'Client selected candidate'),

('interview_completed',
 'rejected_interview',
 'Client rejected candidate'),

('interview_completed',
 'on_hold',
 'Client placed candidate on hold'),

('on_hold',
 'selected',
 'On-hold candidate selected'),

('on_hold',
 'rejected_interview',
 'On-hold candidate rejected'),

('selected',
 'offer_pending',
 'Offer being prepared'),

('selected',
 'offer_received',
 'Offer uploaded'),

('offer_pending',
 'offer_received',
 'Offer uploaded'),

('offer_received',
 'placed',
 'Student accepted offer'),

('offer_received',
 'selected',
 'Student declined offer'),

('verified',
 'withdrawn',
 'Candidate withdrew'),

('submitted_to_client',
 'withdrawn',
 'Candidate withdrew'),

('client_review',
 'withdrawn',
 'Candidate withdrew'),

('shortlisted',
 'withdrawn',
 'Candidate withdrew'),

('mock_pending',
 'withdrawn',
 'Candidate withdrew'),

('mock_scheduled',
 'withdrawn',
 'Candidate withdrew'),

('mock_completed',
 'withdrawn',
 'Candidate withdrew'),

('interview_scheduled',
 'withdrawn',
 'Candidate withdrew'),

('selected',
 'withdrawn',
 'Candidate withdrew'),

('offer_received',
 'withdrawn',
 'Candidate withdrew');


-- ============================================================
-- 8. STATE MACHINE TRIGGER
-- ============================================================

create or replace function
public.enforce_application_state_transition()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin

    if new.status = old.status then
        return new;
    end if;

    if not exists (
        select 1

        from public.application_state_transitions ast

        where ast.from_status =
              old.status

          and ast.to_status =
              new.status
    ) then

        raise exception
        'Invalid application state transition: % -> %',
        old.status,
        new.status;

    end if;

    return new;

end;
$$;

drop trigger if exists
applications_enforce_state_transition
on public.applications;

create trigger
applications_enforce_state_transition

before update of status

on public.applications

for each row

execute function
public.enforce_application_state_transition();


-- ============================================================
-- 9. ROLE HELPER - SECURE VERSION
-- ============================================================

create or replace function
public.has_role(
    requested_role text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$

    select exists (

        select 1

        from public.user_roles ur

        join public.roles r
          on r.id =
             ur.role_id

        where ur.user_id =
              auth.uid()

          and r.name =
              requested_role
    );

$$;


create or replace function
public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$

    select
        public.has_role(
            'admin'
        )
        or
        public.has_role(
            'super_admin'
        );

$$;


-- ============================================================
-- 10. AUTHENTICATED USER PROFILE HELPER
-- ============================================================

create or replace function
public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$

    select p.id

    from public.profiles p

    where p.id =
          auth.uid()

      and p.account_status =
          'approved'

    limit 1;

$$;


-- ============================================================
-- 11. REVOKE LEGACY UNSAFE RPC SIGNATURES
-- ============================================================

do $$
declare
    fn regprocedure;
begin

    fn :=
        to_regprocedure(
            'public.claim_application_verification(uuid,uuid)'
        );

    if fn is not null then

        execute format(
            'revoke all on function %s from public',
            fn
        );

        execute format(
            'revoke all on function %s from authenticated',
            fn
        );

    end if;


    fn :=
        to_regprocedure(
            'public.verify_application(uuid,uuid,text)'
        );

    if fn is not null then

        execute format(
            'revoke all on function %s from public',
            fn
        );

        execute format(
            'revoke all on function %s from authenticated',
            fn
        );

    end if;


    fn :=
        to_regprocedure(
            'public.approve_job_checklist(uuid,uuid)'
        );

    if fn is not null then

        execute format(
            'revoke all on function %s from public',
            fn
        );

        execute format(
            'revoke all on function %s from authenticated',
            fn
        );

    end if;


    fn :=
        to_regprocedure(
            'public.create_client_submission(uuid,uuid,uuid[],text)'
        );

    if fn is not null then

        execute format(
            'revoke all on function %s from public',
            fn
        );

        execute format(
            'revoke all on function %s from authenticated',
            fn
        );

    end if;

end;
$$;


-- ============================================================
-- 12. SECURE VERIFICATION CLAIM RPC
-- ============================================================

create or replace function
public.claim_application_verification(
    p_application_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_actor uuid;
    v_assignment_id uuid;
begin

    v_actor :=
        auth.uid();

    if v_actor is null then
        raise exception
        'Authentication required';
    end if;

    if not (
        public.has_role(
            'placement_hr'
        )
        or
        public.is_admin()
    ) then
        raise exception
        'Not authorized';
    end if;

    perform 1

    from public.applications

    where id =
          p_application_id

      and status =
          'verification_pending'

    for update;

    if not found then
        raise exception
        'Application unavailable for verification';
    end if;


    update
    public.verification_assignments

    set
        status = 'expired'

    where application_id =
          p_application_id

      and status = 'active'

      and expires_at <
          now();


    if exists (

        select 1

        from public.verification_assignments

        where application_id =
              p_application_id

          and status =
              'active'

          and assigned_to <>
              v_actor

    ) then

        raise exception
        'Application is already assigned to another HR user';

    end if;


    insert into
    public.verification_assignments (
        application_id,
        assigned_to,
        assigned_by,
        assignment_type,
        status,
        claimed_at,
        expires_at
    )
    values (
        p_application_id,
        v_actor,
        v_actor,
        'claimed',
        'active',
        now(),
        now() +
        interval '30 minutes'
    )

    on conflict do nothing

    returning id
    into v_assignment_id;


    if v_assignment_id is null then

        select id
        into v_assignment_id

        from public.verification_assignments

        where application_id =
              p_application_id

          and assigned_to =
              v_actor

          and status =
              'active'

        limit 1;

    end if;


    update public.applications

    set
        status =
            'under_verification',

        updated_at =
            now()

    where id =
          p_application_id;


    return v_assignment_id;

end;
$$;

revoke all
on function
public.claim_application_verification(uuid)
from public;

grant execute
on function
public.claim_application_verification(uuid)
to authenticated;


-- ============================================================
-- 13. VERIFICATION SCORE FINALIZATION
-- ============================================================

create or replace function
public.finalize_application_verification(
    p_application_id uuid,
    p_decision varchar,
    p_verified_match_score numeric default null,
    p_verified_ats_score numeric default null,
    p_notes text default null,
    p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_actor uuid;
    v_application public.applications%rowtype;
    v_verification_id uuid;
begin

    v_actor :=
        auth.uid();

    if not (
        public.has_role(
            'placement_hr'
        )
        or
        public.is_admin()
    ) then
        raise exception
        'Not authorized';
    end if;


    if p_decision not in (
        'verified',
        'rejected',
        'update_requested'
    ) then
        raise exception
        'Invalid verification decision';
    end if;


    select *
    into v_application

    from public.applications

    where id =
          p_application_id

    for update;


    if v_application.id
       is null then

        raise exception
        'Application not found';

    end if;


    if v_application.status <>
       'under_verification'
    then

        raise exception
        'Application is not under verification';

    end if;


    if not exists (

        select 1

        from public.verification_assignments

        where application_id =
              p_application_id

          and assigned_to =
              v_actor

          and status =
              'active'

          and expires_at >
              now()

    )
    and not public.is_admin()
    then

        raise exception
        'Active verification assignment required';

    end if;


    if p_verified_match_score is not null
       and (
           p_verified_match_score < 0
           or
           p_verified_match_score > 100
       )
    then
        raise exception
        'Verified match score must be between 0 and 100';
    end if;


    if p_verified_ats_score is not null
       and (
           p_verified_ats_score < 0
           or
           p_verified_ats_score > 100
       )
    then
        raise exception
        'Verified ATS score must be between 0 and 100';
    end if;


    insert into
    public.application_verifications (
        application_id,
        verification_status,
        original_match_score,
        final_match_score,
        original_ats_score,
        final_ats_score,
        notes,
        rejection_reason,
        verified_by,
        verified_at
    )
    values (
        p_application_id,

        p_decision,

        v_application.match_score,

        coalesce(
            p_verified_match_score,
            v_application.match_score
        ),

        v_application.ats_score,

        coalesce(
            p_verified_ats_score,
            v_application.ats_score
        ),

        p_notes,

        p_reason,

        v_actor,

        now()
    )

    returning id
    into v_verification_id;


    if p_decision =
       'verified'
    then

        update public.applications

        set
            status =
                'verified',

            verified_match_score =
                coalesce(
                    p_verified_match_score,
                    match_score
                ),

            verified_ats_score =
                coalesce(
                    p_verified_ats_score,
                    ats_score
                ),

            updated_at =
                now()

        where id =
              p_application_id;


    elsif p_decision =
          'rejected'
    then

        update public.applications

        set
            status =
                'rejected_internal',

            rejection_reason =
                p_reason,

            updated_at =
                now()

        where id =
              p_application_id;


    else

        update public.applications

        set
            status =
                'update_requested',

            updated_at =
                now()

        where id =
              p_application_id;

    end if;


    update
    public.verification_assignments

    set
        status =
            'completed',

        completed_at =
            now()

    where application_id =
          p_application_id

      and status =
          'active';


    return v_verification_id;

end;
$$;

revoke all
on function
public.finalize_application_verification(
    uuid,
    varchar,
    numeric,
    numeric,
    text,
    text
)
from public;

grant execute
on function
public.finalize_application_verification(
    uuid,
    varchar,
    numeric,
    numeric,
    text,
    text
)
to authenticated;


-- ============================================================
-- 14. RATE LIMIT TABLE
-- ============================================================

create table if not exists
public.rate_limit_buckets (

    bucket_key varchar(255)
        primary key,

    window_started_at timestamptz
        not null,

    request_count integer
        not null default 0,

    updated_at timestamptz
        not null default now(),

    check (
        request_count >= 0
    )
);


-- ============================================================
-- 15. RATE LIMIT FUNCTION
-- ============================================================

create or replace function
public.consume_rate_limit(
    p_bucket_key varchar,
    p_limit integer,
    p_window_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_now timestamptz;
    v_bucket
        public.rate_limit_buckets%rowtype;

    v_allowed boolean;
    v_remaining integer;
    v_reset_at timestamptz;
begin

    if p_limit < 1
       or p_limit > 10000
    then
        raise exception
        'Invalid rate limit';
    end if;

    if p_window_seconds < 1
       or p_window_seconds > 86400
    then
        raise exception
        'Invalid rate limit window';
    end if;

    if length(
        p_bucket_key
    ) > 255 then

        raise exception
        'Invalid rate limit key';

    end if;

    v_now :=
        now();


    insert into
    public.rate_limit_buckets (
        bucket_key,
        window_started_at,
        request_count
    )
    values (
        p_bucket_key,
        v_now,
        1
    )

    on conflict (
        bucket_key
    )
    do update

    set
        window_started_at =
            case

                when
                    public.rate_limit_buckets.window_started_at
                    +
                    make_interval(
                        secs =>
                        p_window_seconds
                    )
                    <= v_now

                then v_now

                else
                    public.rate_limit_buckets.window_started_at

            end,

        request_count =
            case

                when
                    public.rate_limit_buckets.window_started_at
                    +
                    make_interval(
                        secs =>
                        p_window_seconds
                    )
                    <= v_now

                then 1

                else
                    public.rate_limit_buckets.request_count
                    + 1

            end,

        updated_at =
            v_now

    returning *
    into v_bucket;


    v_allowed :=
        v_bucket.request_count
        <=
        p_limit;


    v_remaining :=
        greatest(
            p_limit
            -
            v_bucket.request_count,
            0
        );


    v_reset_at :=
        v_bucket.window_started_at
        +
        make_interval(
            secs =>
            p_window_seconds
        );


    return jsonb_build_object(
        'allowed',
        v_allowed,
        'remaining',
        v_remaining,
        'reset_at',
        v_reset_at
    );

end;
$$;

revoke all
on function
public.consume_rate_limit(
    varchar,
    integer,
    integer
)
from public;

revoke all
on function
public.consume_rate_limit(
    varchar,
    integer,
    integer
)
from authenticated;

grant execute
on function
public.consume_rate_limit(
    varchar,
    integer,
    integer
)
to service_role;


-- ============================================================
-- 16. CLEAN OLD RATE LIMITS
-- ============================================================

create or replace function
public.cleanup_rate_limits()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    v_count integer;
begin

    delete from
    public.rate_limit_buckets

    where updated_at <
          now()
          -
          interval '2 days';

    get diagnostics
        v_count =
        row_count;

    return v_count;

end;
$$;

revoke all
on function
public.cleanup_rate_limits()
from public;

revoke all
on function
public.cleanup_rate_limits()
from authenticated;

grant execute
on function
public.cleanup_rate_limits()
to service_role;


-- ============================================================
-- 17. PRIVATE STORAGE HARDENING
-- ============================================================

update storage.buckets
set public = false
where id in (
    'student-cvs',
    'offer-letters',
    'system-exports'
);


-- Client browsers should NOT read raw storage objects directly.
-- Signed URLs are generated by authorized server endpoints.

drop policy if exists
"Students can read CV files"
on storage.objects;

drop policy if exists
"Clients can read CV files"
on storage.objects;

drop policy if exists
"Students can read offer files"
on storage.objects;

drop policy if exists
"Clients can read offer files"
on storage.objects;


-- ============================================================
-- 18. USER PROFILE INDEXES
-- ============================================================

create index if not exists
student_profiles_user_id_idx
on public.student_profiles(user_id);

create index if not exists
student_profiles_enrollment_id_idx
on public.student_profiles(enrollment_id);

create index if not exists
client_hr_profiles_user_idx
on public.client_hr_profiles(user_id);

create index if not exists
client_hr_profiles_company_idx
on public.client_hr_profiles(company_id);

create index if not exists
user_roles_user_idx
on public.user_roles(user_id);


-- ============================================================
-- 19. APPLICATION PERFORMANCE INDEXES
-- ============================================================

create index if not exists
applications_student_status_idx
on public.applications(
    student_id,
    status
);

create index if not exists
applications_job_status_idx
on public.applications(
    job_id,
    status
);

create index if not exists
applications_status_created_idx
on public.applications(
    status,
    created_at desc
);

create index if not exists
applications_verification_queue_idx
on public.applications(
    verification_due_at,
    created_at
)
where status =
      'verification_pending';

create index if not exists
applications_verified_candidate_pool_idx
on public.applications(
    job_id,
    verified_match_score desc,
    match_score desc
)
where status =
      'verified';


-- ============================================================
-- 20. JOB FEED INDEX
-- ============================================================

create index if not exists
jobs_student_feed_idx
on public.jobs(
    status,
    published_at desc
)
where status =
      'published'
  and deleted_at
      is null;


-- ============================================================
-- 21. AUDIT LOG INDEX
-- ============================================================

create index if not exists
audit_logs_entity_idx
on public.audit_logs(
    entity_type,
    entity_id,
    created_at desc
);

create index if not exists
audit_logs_actor_idx
on public.audit_logs(
    actor_id,
    created_at desc
);


-- ============================================================
-- 22. PROTECT CORE TABLES WITH RLS
-- ============================================================

alter table public.profiles
enable row level security;

alter table public.roles
enable row level security;

alter table public.permissions
enable row level security;

alter table public.role_permissions
enable row level security;

alter table public.user_roles
enable row level security;

alter table public.companies
enable row level security;

alter table public.client_hr_profiles
enable row level security;

alter table public.placement_hr_profiles
enable row level security;

alter table public.student_profiles
enable row level security;

alter table public.student_cvs
enable row level security;

alter table public.jobs
enable row level security;

alter table public.applications
enable row level security;

alter table public.audit_logs
enable row level security;


-- ============================================================
-- 23. PROFILE SELF READ
-- ============================================================

drop policy if exists
"Users view own profile"
on public.profiles;

create policy
"Users view own profile"

on public.profiles

for select

to authenticated

using (
    id =
    auth.uid()
);


-- ============================================================
-- 24. ADMIN PROFILE READ
-- ============================================================

drop policy if exists
"Admin views all profiles"
on public.profiles;

create policy
"Admin views all profiles"

on public.profiles

for select

to authenticated

using (
    public.is_admin()
);


-- ============================================================
-- 25. STUDENT OWN PROFILE
-- ============================================================

drop policy if exists
"Student views own student profile"
on public.student_profiles;

create policy
"Student views own student profile"

on public.student_profiles

for select

to authenticated

using (
    user_id =
    auth.uid()
);


drop policy if exists
"Student updates own student profile"
on public.student_profiles;

create policy
"Student updates own student profile"

on public.student_profiles

for update

to authenticated

using (
    user_id =
    auth.uid()
)

with check (
    user_id =
    auth.uid()
);


-- ============================================================
-- 26. STUDENT APPLICATION READ
-- ============================================================

drop policy if exists
"Students view own applications"
on public.applications;

create policy
"Students view own applications"

on public.applications

for select

to authenticated

using (
    exists (

        select 1

        from public.student_profiles sp

        where sp.id =
              applications.student_id

          and sp.user_id =
              auth.uid()
    )
);


-- ============================================================
-- 27. CLIENT MUST NOT DIRECTLY READ APPLICATIONS
-- ============================================================

drop policy if exists
"Client HR reads applications"
on public.applications;

drop policy if exists
"Clients view applications"
on public.applications;


-- ============================================================
-- 28. PLACEMENT HR APPLICATION READ
-- ============================================================

drop policy if exists
"Placement team views applications"
on public.applications;

create policy
"Placement team views applications"

on public.applications

for select

to authenticated

using (
    public.is_admin()
    or
    public.has_role(
        'placement_hr'
    )
);


-- ============================================================
-- 29. AUDIT LOG READ
-- ============================================================

drop policy if exists
"Admin views audit logs"
on public.audit_logs;

create policy
"Admin views audit logs"

on public.audit_logs

for select

to authenticated

using (
    public.is_admin()
);


-- ============================================================
-- 30. PROTECT STATE TRANSITION MATRIX
-- ============================================================

alter table
public.application_state_transitions
enable row level security;

drop policy if exists
"Authenticated users read application state transitions"
on public.application_state_transitions;

create policy
"Authenticated users read application state transitions"

on public.application_state_transitions

for select

to authenticated

using (true);


-- ============================================================
-- 31. RATE LIMIT TABLE HAS NO CLIENT POLICIES
-- ============================================================

alter table
public.rate_limit_buckets
enable row level security;


-- ============================================================
-- 32. PUBLIC FUNCTION SEARCH PATH HARDENING
-- ============================================================

alter function
public.has_role(text)
set search_path = public;

alter function
public.is_admin()
set search_path = public;

alter function
public.current_profile_id()
set search_path = public;


-- ============================================================
-- 33. CHECKLIST APPROVAL SECURITY
-- ============================================================

create or replace function
public.approve_job_checklist(
    p_checklist_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_actor uuid;
    v_job_id uuid;
begin

    v_actor :=
        auth.uid();

    if not (
        public.has_role(
            'placement_hr'
        )
        or
        public.is_admin()
    ) then

        raise exception
        'Not authorized';

    end if;


    select job_id
    into v_job_id

    from public.job_checklists

    where id =
          p_checklist_id

      and status =
          'draft'

    for update;


    if v_job_id is null then

        raise exception
        'Checklist draft not found';

    end if;


    update public.job_checklists

    set status =
        'superseded'

    where job_id =
          v_job_id

      and status =
          'approved';


    update public.job_checklists

    set
        status =
            'approved',

        approved_by =
            v_actor,

        approved_at =
            now(),

        updated_at =
            now()

    where id =
          p_checklist_id;


    return p_checklist_id;

end;
$$;

revoke all
on function
public.approve_job_checklist(uuid)
from public;

grant execute
on function
public.approve_job_checklist(uuid)
to authenticated;


-- ============================================================
-- 34. FINAL SCHEMA VERSION TABLE
-- ============================================================

create table if not exists
public.system_schema_versions (

    version varchar(50)
        primary key,

    applied_at timestamptz
        not null default now(),

    description text
);


insert into
public.system_schema_versions (
    version,
    description
)
values (
    '13.0',
    'Schema and security consolidation'
)
on conflict (
    version
)
do nothing;


commit;