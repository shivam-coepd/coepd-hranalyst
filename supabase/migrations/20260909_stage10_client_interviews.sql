-- ============================================================
-- HRANALYST PLACEMENT WING
-- STAGE 10
-- CLIENT SHORTLISTING + INTERVIEW SCHEDULING
-- ============================================================

-- ------------------------------------------------------------
-- 1. CLIENT CANDIDATE DECISIONS
-- ------------------------------------------------------------

create table if not exists public.client_candidate_decisions (
    id uuid primary key default gen_random_uuid(),

    submission_candidate_id uuid not null
        references public.submission_candidates(id),

    application_id uuid not null
        references public.applications(id),

    company_id uuid not null
        references public.companies(id),

    decision varchar(30) not null
        check (
            decision in (
                'shortlisted',
                'rejected'
            )
        ),

    reason_code varchar(100),

    reason text,

    decision_version integer not null default 1,

    is_current boolean not null default true,

    decided_by uuid not null
        references public.profiles(id),

    decided_at timestamptz not null default now(),

    created_at timestamptz not null default now(),

    check (
        decision <> 'rejected'
        or reason is not null
    )
);

create unique index if not exists
client_candidate_decisions_current_idx
on public.client_candidate_decisions(submission_candidate_id)
where is_current = true;

create index if not exists
client_candidate_decisions_application_idx
on public.client_candidate_decisions(application_id);

create index if not exists
client_candidate_decisions_company_idx
on public.client_candidate_decisions(company_id);

create index if not exists
client_candidate_decisions_decided_at_idx
on public.client_candidate_decisions(decided_at desc);


-- ------------------------------------------------------------
-- 2. DECISION HISTORY
-- ------------------------------------------------------------

create table if not exists public.client_candidate_decision_history (
    id bigint generated always as identity primary key,

    submission_candidate_id uuid not null
        references public.submission_candidates(id),

    old_decision varchar(30),

    new_decision varchar(30) not null,

    reason_code varchar(100),

    reason text,

    changed_by uuid not null
        references public.profiles(id),

    changed_at timestamptz not null default now()
);

create index if not exists
client_candidate_decision_history_candidate_idx
on public.client_candidate_decision_history(
    submission_candidate_id,
    changed_at desc
);


-- ------------------------------------------------------------
-- 3. INTERVIEWS
-- ------------------------------------------------------------

create table if not exists public.interviews (
    id uuid primary key default gen_random_uuid(),

    interview_code varchar(50) unique,

    application_id uuid not null
        references public.applications(id),

    submission_candidate_id uuid not null
        references public.submission_candidates(id),

    job_id uuid not null
        references public.jobs(id),

    company_id uuid not null
        references public.companies(id),

    client_hr_user_id uuid not null
        references public.profiles(id),

    round_number integer not null default 1,

    round_name varchar(150) not null,

    interview_type varchar(50) not null default 'client'
        check (
            interview_type in (
                'client',
                'technical',
                'managerial',
                'hr',
                'final',
                'other'
            )
        ),

    scheduled_at timestamptz not null,

    duration_minutes integer not null default 60,

    timezone varchar(100) not null default 'Asia/Kolkata',

    mode varchar(30) not null
        check (
            mode in (
                'online',
                'offline'
            )
        ),

    meeting_provider varchar(50),

    meeting_link text,

    location text,

    instructions text,

    status varchar(40) not null default 'scheduled'
        check (
            status in (
                'scheduled',
                'confirmed',
                'rescheduled',
                'in_progress',
                'completed',
                'cancelled',
                'candidate_no_show',
                'client_no_show'
            )
        ),

    scheduled_by uuid not null
        references public.profiles(id),

    scheduled_at_created timestamptz not null default now(),

    started_at timestamptz,

    completed_at timestamptz,

    cancelled_at timestamptz,

    cancelled_by uuid
        references public.profiles(id),

    cancellation_reason text,

    external_calendar_provider varchar(50),

    external_calendar_event_id text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    deleted_at timestamptz,

    deleted_by uuid
        references public.profiles(id),

    check (
        round_number > 0
    ),

    check (
        duration_minutes between 15 and 480
    ),

    check (
        mode <> 'online'
        or meeting_link is not null
    ),

    check (
        mode <> 'offline'
        or location is not null
    )
);


-- ------------------------------------------------------------
-- 4. INTERVIEW CODE
-- ------------------------------------------------------------

create sequence if not exists
public.interview_code_seq;

create or replace function
public.generate_interview_code()
returns trigger
language plpgsql
as $$
begin

    if new.interview_code is null then

        new.interview_code :=
            'HRA-INT-' ||
            to_char(now(), 'YYYY') ||
            '-' ||
            lpad(
                nextval(
                    'public.interview_code_seq'
                )::text,
                6,
                '0'
            );

    end if;

    return new;

end;
$$;

drop trigger if exists
set_interview_code
on public.interviews;

create trigger
set_interview_code
before insert
on public.interviews
for each row
execute function
public.generate_interview_code();


-- ------------------------------------------------------------
-- 5. INTERVIEW STATUS HISTORY
-- ------------------------------------------------------------

create table if not exists public.interview_status_history (
    id bigint generated always as identity primary key,

    interview_id uuid not null
        references public.interviews(id)
        on delete cascade,

    old_status varchar(40),

    new_status varchar(40) not null,

    changed_by uuid
        references public.profiles(id),

    reason text,

    metadata jsonb,

    changed_at timestamptz not null default now()
);

create index if not exists
interview_status_history_interview_idx
on public.interview_status_history(
    interview_id,
    changed_at desc
);


-- ------------------------------------------------------------
-- 6. INTERVIEW RESCHEDULE HISTORY
-- ------------------------------------------------------------

create table if not exists public.interview_reschedules (
    id uuid primary key default gen_random_uuid(),

    interview_id uuid not null
        references public.interviews(id)
        on delete cascade,

    old_scheduled_at timestamptz not null,

    new_scheduled_at timestamptz not null,

    old_timezone varchar(100),

    new_timezone varchar(100),

    old_mode varchar(30),

    new_mode varchar(30),

    old_meeting_link text,

    new_meeting_link text,

    old_location text,

    new_location text,

    reason text not null,

    rescheduled_by uuid not null
        references public.profiles(id),

    rescheduled_at timestamptz not null default now()
);

create index if not exists
interview_reschedules_interview_idx
on public.interview_reschedules(
    interview_id,
    rescheduled_at desc
);


-- ------------------------------------------------------------
-- 7. INTERVIEW PARTICIPANTS
-- ------------------------------------------------------------

create table if not exists public.interview_participants (
    id uuid primary key default gen_random_uuid(),

    interview_id uuid not null
        references public.interviews(id)
        on delete cascade,

    participant_type varchar(30) not null
        check (
            participant_type in (
                'candidate',
                'client_hr',
                'placement_hr',
                'panel_member',
                'observer'
            )
        ),

    user_id uuid
        references public.profiles(id),

    external_name varchar(255),

    external_email varchar(255),

    attendance_status varchar(30)
        check (
            attendance_status in (
                'unknown',
                'present',
                'late',
                'absent'
            )
        )
        default 'unknown',

    created_at timestamptz not null default now(),

    check (
        user_id is not null
        or external_email is not null
    )
);

create index if not exists
interview_participants_interview_idx
on public.interview_participants(interview_id);


-- ------------------------------------------------------------
-- 8. CANONICAL NOTIFICATION OUTBOX
-- ------------------------------------------------------------

create table if not exists public.notification_outbox (
    id uuid primary key default gen_random_uuid(),

    event_type varchar(100) not null,

    channel varchar(30) not null
        check (
            channel in (
                'in_app',
                'email',
                'whatsapp',
                'telegram',
                'calendar'
            )
        ),

    recipient_user_id uuid
        references public.profiles(id),

    recipient_email varchar(255),

    entity_type varchar(100),

    entity_id uuid,

    payload jsonb not null default '{}'::jsonb,

    status varchar(30) not null default 'pending'
        check (
            status in (
                'pending',
                'processing',
                'sent',
                'failed',
                'cancelled'
            )
        ),

    attempts integer not null default 0,

    max_attempts integer not null default 3,

    scheduled_for timestamptz not null default now(),

    processing_started_at timestamptz,

    sent_at timestamptz,

    failed_at timestamptz,

    error_message text,

    dedupe_key varchar(255),

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    check (
        recipient_user_id is not null
        or recipient_email is not null
    )
);

create unique index if not exists
notification_outbox_dedupe_idx
on public.notification_outbox(dedupe_key)
where dedupe_key is not null;

create index if not exists
notification_outbox_processing_idx
on public.notification_outbox(
    status,
    scheduled_for
);


-- ------------------------------------------------------------
-- 9. INTERVIEW INDEXES
-- ------------------------------------------------------------

create index if not exists
interviews_application_idx
on public.interviews(application_id);

create index if not exists
interviews_submission_candidate_idx
on public.interviews(submission_candidate_id);

create index if not exists
interviews_company_idx
on public.interviews(company_id);

create index if not exists
interviews_client_hr_idx
on public.interviews(
    client_hr_user_id,
    scheduled_at
);

create index if not exists
interviews_scheduled_idx
on public.interviews(scheduled_at);

create index if not exists
interviews_status_idx
on public.interviews(status);


-- ------------------------------------------------------------
-- 10. ONLY ONE ACTIVE INTERVIEW PER ROUND
-- ------------------------------------------------------------

create unique index if not exists
interviews_active_round_idx
on public.interviews(
    application_id,
    round_number
)
where status in (
    'scheduled',
    'confirmed',
    'rescheduled',
    'in_progress'
);


-- ------------------------------------------------------------
-- 11. UPDATED_AT TRIGGERS
-- ------------------------------------------------------------

drop trigger if exists
interviews_set_updated_at
on public.interviews;

create trigger
interviews_set_updated_at
before update
on public.interviews
for each row
execute function
public.set_updated_at();


drop trigger if exists
notification_outbox_set_updated_at
on public.notification_outbox;

create trigger
notification_outbox_set_updated_at
before update
on public.notification_outbox
for each row
execute function
public.set_updated_at();


-- ------------------------------------------------------------
-- 12. RLS
-- ------------------------------------------------------------

alter table public.client_candidate_decisions
enable row level security;

alter table public.client_candidate_decision_history
enable row level security;

alter table public.interviews
enable row level security;

alter table public.interview_status_history
enable row level security;

alter table public.interview_reschedules
enable row level security;

alter table public.interview_participants
enable row level security;

alter table public.notification_outbox
enable row level security;


-- ------------------------------------------------------------
-- 13. CLIENT HR - DECISION READ
-- ------------------------------------------------------------

drop policy if exists
"Client HR views own candidate decisions"
on public.client_candidate_decisions;

create policy
"Client HR views own candidate decisions"
on public.client_candidate_decisions
for select
to authenticated
using (
    exists (
        select 1
        from public.client_hr_profiles chp
        where chp.user_id = auth.uid()
          and chp.company_id =
              client_candidate_decisions.company_id
          and chp.is_active = true
    )
);


-- ------------------------------------------------------------
-- 14. CLIENT HR - INTERVIEW READ
-- ------------------------------------------------------------

drop policy if exists
"Client HR views own company interviews"
on public.interviews;

create policy
"Client HR views own company interviews"
on public.interviews
for select
to authenticated
using (
    exists (
        select 1
        from public.client_hr_profiles chp
        where chp.user_id = auth.uid()
          and chp.company_id = interviews.company_id
          and chp.is_active = true
    )
);


-- ------------------------------------------------------------
-- 15. STUDENT INTERVIEW READ
-- ------------------------------------------------------------

drop policy if exists
"Students view own interviews"
on public.interviews;

create policy
"Students view own interviews"
on public.interviews
for select
to authenticated
using (
    exists (
        select 1

        from public.applications a

        join public.student_profiles sp
          on sp.id = a.student_id

        where a.id = interviews.application_id
          and sp.user_id = auth.uid()
    )
);


-- ------------------------------------------------------------
-- 16. ADMIN / PLACEMENT HR READ
-- ------------------------------------------------------------

drop policy if exists
"Placement team views interviews"
on public.interviews;

create policy
"Placement team views interviews"
on public.interviews
for select
to authenticated
using (
    public.is_admin()
    or
    public.has_role('placement_hr')
);


-- ------------------------------------------------------------
-- 17. DECISION RPC
-- ------------------------------------------------------------

create or replace function
public.client_decide_candidate(
    p_submission_candidate_id uuid,
    p_decision varchar,
    p_reason_code varchar default null,
    p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_actor uuid;
    v_company_id uuid;
    v_application_id uuid;
    v_old_decision varchar(30);
    v_old_status varchar(40);
    v_version integer;
    v_decision_id uuid;
begin

    v_actor := auth.uid();

    if v_actor is null then
        raise exception 'Authentication required';
    end if;

    if p_decision not in (
        'shortlisted',
        'rejected'
    ) then
        raise exception
        'Invalid decision';
    end if;

    if p_decision = 'rejected'
       and (
           p_reason is null
           or length(trim(p_reason)) = 0
       ) then
        raise exception
        'Rejection reason is required';
    end if;

    select
        s.company_id,
        sc.application_id,
        a.status
    into
        v_company_id,
        v_application_id,
        v_old_status
        from public.submission_candidates sc

    join public.submissions s
        on s.id = sc.submission_id

    join public.applications a
        on a.id = sc.application_id

    where sc.id =
        p_submission_candidate_id
    and s.status <>
        'cancelled'

    for update of sc, a;

    if v_application_id is null then
        raise exception
        'Submitted candidate not found';
    end if;

    if not exists (
        select 1
        from public.client_hr_profiles chp
        where chp.user_id = v_actor
          and chp.company_id = v_company_id
          and chp.is_active = true
    ) then
        raise exception
        'Not authorized for this company';
    end if;

    select decision
    into v_old_decision
    from public.client_candidate_decisions
    where submission_candidate_id =
        p_submission_candidate_id
      and is_current = true
    limit 1;

    select
        coalesce(
            max(decision_version),
            0
        ) + 1
    into v_version
    from public.client_candidate_decisions
    where submission_candidate_id =
        p_submission_candidate_id;

    update public.client_candidate_decisions
    set is_current = false
    where submission_candidate_id =
        p_submission_candidate_id
      and is_current = true;

    insert into public.client_candidate_decisions (
        submission_candidate_id,
        application_id,
        company_id,
        decision,
        reason_code,
        reason,
        decision_version,
        is_current,
        decided_by
    )
    values (
        p_submission_candidate_id,
        v_application_id,
        v_company_id,
        p_decision,
        p_reason_code,
        p_reason,
        v_version,
        true,
        v_actor
    )
    returning id
    into v_decision_id;

    insert into public.client_candidate_decision_history (
        submission_candidate_id,
        old_decision,
        new_decision,
        reason_code,
        reason,
        changed_by
    )
    values (
        p_submission_candidate_id,
        v_old_decision,
        p_decision,
        p_reason_code,
        p_reason,
        v_actor
    );

    if p_decision =
       'shortlisted' then

        update public.submission_candidates
        set
            status = 'shortlisted',
            client_decision_at = now()
        where id =
            p_submission_candidate_id;

        update public.applications
        set
            status = 'shortlisted',
            shortlisted_at = now(),
            updated_at = now()
        where id =
            v_application_id;

        insert into public.application_status_history (
    application_id,
    old_status,
    new_status,
    changed_by,
    reason
)
values (
    v_application_id,
    v_old_status,
    'shortlisted',
    v_actor,
    p_reason
);

    else

        update public.submission_candidates
        set
            status = 'rejected',
            client_decision_at = now()
        where id =
            p_submission_candidate_id;

        update public.applications
        set
            status = 'rejected_client',
            rejection_reason = p_reason,
            updated_at = now()
        where id =
            v_application_id;

        insert into public.application_status_history (
            application_id,
            old_status,
            new_status,
            changed_by,
            reason
        )
        values (
            v_application_id,
            v_old_status,
            'rejected_client',
            v_actor,
            p_reason
        );

    end if;

    insert into public.notification_outbox (
        event_type,
        channel,
        recipient_user_id,
        entity_type,
        entity_id,
        payload,
        dedupe_key
    )
    select
        case
            when p_decision =
                'shortlisted'
            then
                'CLIENT_CANDIDATE_SHORTLISTED'
            else
                'CLIENT_CANDIDATE_REJECTED'
        end,
        'in_app',
        sp.user_id,
        'application',
        v_application_id,
        jsonb_build_object(
            'application_id',
            v_application_id,
            'submission_candidate_id',
            p_submission_candidate_id,
            'decision',
            p_decision,
            'reason',
            p_reason
        ),
        'client-decision:' ||
        v_decision_id::text ||
        ':student'
    from public.applications a
    join public.student_profiles sp
      on sp.id = a.student_id
    where a.id =
        v_application_id;

    return v_decision_id;

end;
$$;


-- ------------------------------------------------------------
-- 18. INTERVIEW SCHEDULING RPC
-- ------------------------------------------------------------

create or replace function
public.schedule_client_interview(
    p_submission_candidate_id uuid,
    p_round_number integer,
    p_round_name varchar,
    p_interview_type varchar,
    p_scheduled_at timestamptz,
    p_duration_minutes integer,
    p_timezone varchar,
    p_mode varchar,
    p_meeting_provider varchar,
    p_meeting_link text,
    p_location text,
    p_instructions text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_actor uuid;
    v_application_id uuid;
    v_job_id uuid;
    v_company_id uuid;
    v_student_user_id uuid;
    v_interview_id uuid;
    v_old_application_status varchar(40);
begin

    v_actor :=
        auth.uid();

    if v_actor is null then
        raise exception
        'Authentication required';
    end if;

    if p_round_number < 1 then
        raise exception
        'Round number must be at least 1';
    end if;

    if p_scheduled_at <= now() then
        raise exception
        'Interview must be scheduled in the future';
    end if;

    if p_duration_minutes < 15
       or p_duration_minutes > 480 then
        raise exception
        'Invalid interview duration';
    end if;

    if p_mode not in (
        'online',
        'offline'
    ) then
        raise exception
        'Invalid interview mode';
    end if;

    if p_mode = 'online'
       and (
           p_meeting_link is null
           or length(
               trim(
                   p_meeting_link
               )
           ) = 0
       ) then
        raise exception
        'Meeting link is required for online interview';
    end if;

    if p_mode = 'offline'
       and (
           p_location is null
           or length(
               trim(
                   p_location
               )
           ) = 0
       ) then
        raise exception
        'Location is required for offline interview';
    end if;

    select
        sc.application_id,
        s.job_id,
        s.company_id,
        a.status,
        sp.user_id
    into
        v_application_id,
        v_job_id,
        v_company_id,
        v_old_application_status,
        v_student_user_id
    from public.submission_candidates sc

    join public.submissions s
      on s.id = sc.submission_id

    join public.applications a
      on a.id = sc.application_id

    join public.student_profiles sp
      on sp.id = a.student_id

    where sc.id =
        p_submission_candidate_id

      and sc.status =
        'shortlisted'

      and s.status <>
        'cancelled'

    for update of sc, a;

    if v_application_id is null then
        raise exception
        'Candidate must be shortlisted first';
    end if;

    if not exists (
        select 1
        from public.client_hr_profiles chp
        where chp.user_id =
            v_actor
          and chp.company_id =
            v_company_id
          and chp.is_active =
            true
    ) then
        raise exception
        'Not authorized for this company';
    end if;

    -- HARD PRD QUALITY GATE:
    -- completed mock + submitted scorecard required
    if not exists (
        select 1

        from public.mock_interviews mi

        join public.mock_scorecards ms
          on ms.mock_interview_id =
             mi.id

        where mi.application_id =
            v_application_id

          and mi.status =
            'completed'

          and ms.status =
            'submitted'
    ) then

        raise exception
        'Mock interview must be completed before client interview';

    end if;

    if exists (
        select 1
        from public.interviews i
        where i.application_id =
            v_application_id
          and i.round_number =
            p_round_number
          and i.status in (
              'scheduled',
              'confirmed',
              'rescheduled',
              'in_progress'
          )
    ) then

        raise exception
        'An active interview already exists for this round';

    end if;

    insert into public.interviews (
        application_id,
        submission_candidate_id,
        job_id,
        company_id,
        client_hr_user_id,
        round_number,
        round_name,
        interview_type,
        scheduled_at,
        duration_minutes,
        timezone,
        mode,
        meeting_provider,
        meeting_link,
        location,
        instructions,
        status,
        scheduled_by
    )
    values (
        v_application_id,
        p_submission_candidate_id,
        v_job_id,
        v_company_id,
        v_actor,
        p_round_number,
        trim(p_round_name),
        p_interview_type,
        p_scheduled_at,
        p_duration_minutes,
        p_timezone,
        p_mode,
        p_meeting_provider,
        p_meeting_link,
        p_location,
        p_instructions,
        'scheduled',
        v_actor
    )
    returning id
    into v_interview_id;

    insert into public.interview_participants (
        interview_id,
        participant_type,
        user_id
    )
    values (
        v_interview_id,
        'candidate',
        v_student_user_id
    );

    insert into public.interview_participants (
        interview_id,
        participant_type,
        user_id
    )
    values (
        v_interview_id,
        'client_hr',
        v_actor
    );

    insert into public.interview_status_history (
        interview_id,
        old_status,
        new_status,
        changed_by
    )
    values (
        v_interview_id,
        null,
        'scheduled',
        v_actor
    );

    update public.applications
    set
        status =
            'interview_scheduled',

        updated_at =
            now()
    where id =
        v_application_id;

    insert into public.application_status_history (
        application_id,
        old_status,
        new_status,
        changed_by,
        metadata
    )
    values (
        v_application_id,
        v_old_application_status,
        'interview_scheduled',
        v_actor,
        jsonb_build_object(
            'interview_id',
            v_interview_id,
            'round_number',
            p_round_number
        )
    );

    -- Candidate in-app
    insert into public.notification_outbox (
        event_type,
        channel,
        recipient_user_id,
        entity_type,
        entity_id,
        payload,
        dedupe_key
    )
    values (
        'CLIENT_INTERVIEW_SCHEDULED',
        'in_app',
        v_student_user_id,
        'interview',
        v_interview_id,
        jsonb_build_object(
            'interview_id',
            v_interview_id,
            'application_id',
            v_application_id,
            'scheduled_at',
            p_scheduled_at,
            'round_number',
            p_round_number,
            'round_name',
            p_round_name,
            'mode',
            p_mode
        ),
        'interview:' ||
        v_interview_id::text ||
        ':student:inapp'
    );

    -- Admin notifications
    insert into public.notification_outbox (
        event_type,
        channel,
        recipient_user_id,
        entity_type,
        entity_id,
        payload,
        dedupe_key
    )
    select
        'CLIENT_INTERVIEW_SCHEDULED',
        'in_app',
        ur.user_id,
        'interview',
        v_interview_id,
        jsonb_build_object(
            'interview_id',
            v_interview_id,
            'application_id',
            v_application_id,
            'company_id',
            v_company_id,
            'scheduled_at',
            p_scheduled_at
        ),
        'interview:' ||
        v_interview_id::text ||
        ':admin:' ||
        ur.user_id::text
    from public.user_roles ur
    join public.roles r
      on r.id = ur.role_id
    where r.name in (
        'admin',
        'super_admin'
    );

    return v_interview_id;

end;
$$;


-- ------------------------------------------------------------
-- 19. RESCHEDULE RPC
-- ------------------------------------------------------------

create or replace function
public.reschedule_client_interview(
    p_interview_id uuid,
    p_new_scheduled_at timestamptz,
    p_new_timezone varchar,
    p_new_mode varchar,
    p_new_meeting_provider varchar,
    p_new_meeting_link text,
    p_new_location text,
    p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_actor uuid;
    v_interview public.interviews%rowtype;
begin

    v_actor :=
        auth.uid();

    if p_new_scheduled_at <= now() then
        raise exception
        'Interview must be scheduled in the future';
    end if;

    if p_reason is null
       or length(trim(p_reason)) = 0 then
        raise exception
        'Reschedule reason is required';
    end if;

    select *
    into v_interview
    from public.interviews
    where id =
        p_interview_id
      and deleted_at is null
    for update;

    if v_interview.id is null then
        raise exception
        'Interview not found';
    end if;

    if v_interview.status not in (
        'scheduled',
        'confirmed',
        'rescheduled'
    ) then
        raise exception
        'Interview cannot be rescheduled';
    end if;

    if not exists (
        select 1
        from public.client_hr_profiles chp
        where chp.user_id =
            v_actor
          and chp.company_id =
            v_interview.company_id
          and chp.is_active =
            true
    )
    and not public.is_admin()
    then

        raise exception
        'Not authorized';

    end if;

    if p_new_mode =
       'online'
       and (
           p_new_meeting_link is null
           or length(
               trim(
                   p_new_meeting_link
               )
           ) = 0
       ) then

        raise exception
        'Meeting link is required';

    end if;

    if p_new_mode =
       'offline'
       and (
           p_new_location is null
           or length(
               trim(
                   p_new_location
               )
           ) = 0
       ) then

        raise exception
        'Location is required';

    end if;

    insert into public.interview_reschedules (
        interview_id,
        old_scheduled_at,
        new_scheduled_at,
        old_timezone,
        new_timezone,
        old_mode,
        new_mode,
        old_meeting_link,
        new_meeting_link,
        old_location,
        new_location,
        reason,
        rescheduled_by
    )
    values (
        p_interview_id,
        v_interview.scheduled_at,
        p_new_scheduled_at,
        v_interview.timezone,
        p_new_timezone,
        v_interview.mode,
        p_new_mode,
        v_interview.meeting_link,
        p_new_meeting_link,
        v_interview.location,
        p_new_location,
        p_reason,
        v_actor
    );

    update public.interviews
    set
        scheduled_at =
            p_new_scheduled_at,

        timezone =
            p_new_timezone,

        mode =
            p_new_mode,

        meeting_provider =
            p_new_meeting_provider,

        meeting_link =
            p_new_meeting_link,

        location =
            p_new_location,

        status =
            'rescheduled',

        updated_at =
            now()
    where id =
        p_interview_id;

    insert into public.interview_status_history (
        interview_id,
        old_status,
        new_status,
        changed_by,
        reason
    )
    values (
        p_interview_id,
        v_interview.status,
        'rescheduled',
        v_actor,
        p_reason
    );

end;
$$;


-- ------------------------------------------------------------
-- 20. CANCEL RPC
-- ------------------------------------------------------------

create or replace function
public.cancel_client_interview(
    p_interview_id uuid,
    p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_actor uuid;
    v_interview public.interviews%rowtype;
begin

    v_actor :=
        auth.uid();

    if p_reason is null
       or length(trim(p_reason)) = 0 then
        raise exception
        'Cancellation reason is required';
    end if;

    select *
    into v_interview
    from public.interviews
    where id =
        p_interview_id
    for update;

    if v_interview.id is null then
        raise exception
        'Interview not found';
    end if;

    if v_interview.status in (
        'completed',
        'cancelled'
    ) then
        raise exception
        'Interview cannot be cancelled';
    end if;

    if not exists (
        select 1
        from public.client_hr_profiles chp
        where chp.user_id =
            v_actor
          and chp.company_id =
            v_interview.company_id
          and chp.is_active =
            true
    )
    and not public.is_admin()
    then

        raise exception
        'Not authorized';

    end if;

    update public.interviews
    set
        status =
            'cancelled',

        cancelled_at =
            now(),

        cancelled_by =
            v_actor,

        cancellation_reason =
            p_reason,

        updated_at =
            now()
    where id =
        p_interview_id;

    insert into public.interview_status_history (
        interview_id,
        old_status,
        new_status,
        changed_by,
        reason
    )
    values (
        p_interview_id,
        v_interview.status,
        'cancelled',
        v_actor,
        p_reason
    );

    -- Return application to shortlisted
    -- if no other active interview exists.
    if not exists (
        select 1
        from public.interviews
        where application_id =
            v_interview.application_id
          and id <>
            p_interview_id
          and status in (
              'scheduled',
              'confirmed',
              'rescheduled',
              'in_progress'
          )
    ) then

        update public.applications
        set
            status =
                'shortlisted',

            updated_at =
                now()
        where id =
            v_interview.application_id;

    end if;

end;
$$;


-- ------------------------------------------------------------
-- 21. COMPLETE INTERVIEW RPC
-- Stage 11 will attach feedback afterwards.
-- ------------------------------------------------------------

create or replace function
public.complete_client_interview(
    p_interview_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_actor uuid;
    v_interview public.interviews%rowtype;
begin

    v_actor :=
        auth.uid();

    select *
    into v_interview
    from public.interviews
    where id =
        p_interview_id
    for update;

    if v_interview.id is null then
        raise exception
        'Interview not found';
    end if;

    if not exists (
        select 1
        from public.client_hr_profiles chp
        where chp.user_id =
            v_actor
          and chp.company_id =
            v_interview.company_id
          and chp.is_active =
            true
    )
    and not public.is_admin()
    and not public.has_role(
        'placement_hr'
    )
    then

        raise exception
        'Not authorized';

    end if;

    if v_interview.status not in (
        'scheduled',
        'confirmed',
        'rescheduled',
        'in_progress'
    ) then

        raise exception
        'Interview cannot be completed';

    end if;

    update public.interviews
    set
        status =
            'completed',

        completed_at =
            now(),

        updated_at =
            now()
    where id =
        p_interview_id;

    update public.applications
    set
        status =
            'interview_completed',

        updated_at =
            now()
    where id =
        v_interview.application_id;

    insert into public.interview_status_history (
        interview_id,
        old_status,
        new_status,
        changed_by
    )
    values (
        p_interview_id,
        v_interview.status,
        'completed',
        v_actor
    );

    insert into public.application_status_history (
        application_id,
        old_status,
        new_status,
        changed_by,
        metadata
    )
    values (
        v_interview.application_id,
        'interview_scheduled',
        'interview_completed',
        v_actor,
        jsonb_build_object(
            'interview_id',
            p_interview_id
        )
    );

end;
$$;


-- ------------------------------------------------------------
-- 22. EXECUTE PERMISSIONS
-- ------------------------------------------------------------

revoke all on function
public.client_decide_candidate(
    uuid,
    varchar,
    varchar,
    text
)
from public;

grant execute on function
public.client_decide_candidate(
    uuid,
    varchar,
    varchar,
    text
)
to authenticated;


revoke all on function
public.schedule_client_interview(
    uuid,
    integer,
    varchar,
    varchar,
    timestamptz,
    integer,
    varchar,
    varchar,
    varchar,
    text,
    text,
    text
)
from public;

grant execute on function
public.schedule_client_interview(
    uuid,
    integer,
    varchar,
    varchar,
    timestamptz,
    integer,
    varchar,
    varchar,
    varchar,
    text,
    text,
    text
)
to authenticated;


revoke all on function
public.reschedule_client_interview(
    uuid,
    timestamptz,
    varchar,
    varchar,
    varchar,
    text,
    text,
    text
)
from public;

grant execute on function
public.reschedule_client_interview(
    uuid,
    timestamptz,
    varchar,
    varchar,
    varchar,
    text,
    text,
    text
)
to authenticated;


revoke all on function
public.cancel_client_interview(
    uuid,
    text
)
from public;

grant execute on function
public.cancel_client_interview(
    uuid,
    text
)
to authenticated;


revoke all on function
public.complete_client_interview(
    uuid
)
from public;

grant execute on function
public.complete_client_interview(
    uuid
)
to authenticated;