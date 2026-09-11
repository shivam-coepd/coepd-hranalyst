-- ============================================================
-- HRANALYST PLACEMENT WING
-- STAGE 11
-- FEEDBACK + OFFER + PLACEMENT
-- ============================================================

-- ------------------------------------------------------------
-- 1. INTERVIEW FEEDBACK
-- ------------------------------------------------------------

create table if not exists public.interview_feedbacks (
    id uuid primary key default gen_random_uuid(),

    feedback_code varchar(50) unique,

    interview_id uuid not null
        references public.interviews(id),

    application_id uuid not null
        references public.applications(id),

    submission_candidate_id uuid not null
        references public.submission_candidates(id),

    company_id uuid not null
        references public.companies(id),

    rating numeric(3,2)
        check (
            rating >= 1
            and rating <= 5
        ),

    decision varchar(30) not null
        check (
            decision in (
                'selected',
                'rejected',
                'on_hold'
            )
        ),

    reason_code varchar(100),

    comments text,

    client_visible_to_student boolean
        not null default true,

    feedback_due_at timestamptz,

    feedback_status varchar(30)
        not null default 'submitted'
        check (
            feedback_status in (
                'draft',
                'submitted',
                'revised'
            )
        ),

    submitted_by uuid not null
        references public.profiles(id),

    submitted_at timestamptz not null default now(),

    revised_at timestamptz,

    revised_by uuid
        references public.profiles(id),

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    check (
        decision <> 'rejected'
        or comments is not null
    )
);


-- ------------------------------------------------------------
-- 2. HUMAN FRIENDLY FEEDBACK CODE
-- ------------------------------------------------------------

create sequence if not exists
public.feedback_code_seq;

create or replace function
public.generate_feedback_code()
returns trigger
language plpgsql
as $$
begin

    if new.feedback_code is null then
        new.feedback_code :=
            'HRA-FB-' ||
            to_char(now(), 'YYYY') ||
            '-' ||
            lpad(
                nextval(
                    'public.feedback_code_seq'
                )::text,
                6,
                '0'
            );
    end if;

    return new;
end;
$$;

drop trigger if exists
set_feedback_code
on public.interview_feedbacks;

create trigger
set_feedback_code
before insert
on public.interview_feedbacks
for each row
execute function
public.generate_feedback_code();


-- ------------------------------------------------------------
-- 3. ONE CURRENT FEEDBACK PER INTERVIEW
-- ------------------------------------------------------------

create unique index if not exists
interview_feedback_unique_interview_idx
on public.interview_feedbacks(interview_id);


-- ------------------------------------------------------------
-- 4. FEEDBACK REVISION HISTORY
-- ------------------------------------------------------------

create table if not exists public.interview_feedback_revisions (
    id uuid primary key default gen_random_uuid(),

    feedback_id uuid not null
        references public.interview_feedbacks(id)
        on delete cascade,

    revision_number integer not null,

    previous_rating numeric(3,2),

    previous_decision varchar(30),

    previous_reason_code varchar(100),

    previous_comments text,

    new_rating numeric(3,2),

    new_decision varchar(30),

    new_reason_code varchar(100),

    new_comments text,

    reason text not null,

    revised_by uuid not null
        references public.profiles(id),

    revised_at timestamptz not null default now(),

    unique(
        feedback_id,
        revision_number
    )
);


-- ------------------------------------------------------------
-- 5. OFFERS
-- ------------------------------------------------------------

create table if not exists public.offers (
    id uuid primary key default gen_random_uuid(),

    offer_code varchar(50) unique,

    application_id uuid not null
        references public.applications(id),

    submission_candidate_id uuid not null
        references public.submission_candidates(id),

    interview_feedback_id uuid not null
        references public.interview_feedbacks(id),

    student_id uuid not null
        references public.student_profiles(id),

    job_id uuid not null
        references public.jobs(id),

    company_id uuid not null
        references public.companies(id),

    designation varchar(255) not null,

    department varchar(255),

    employment_type varchar(100),

    joining_location varchar(255),

    annual_ctc numeric(14,2),

    currency varchar(10) not null default 'INR',

    joining_date date,

    offer_date date,

    offer_valid_until date,

    probation_period_months integer,

    notice_buyout_available boolean,

    notes text,

    bucket_name varchar(100) not null default 'offer-letters',

    storage_path text not null,

    original_file_name text not null,

    mime_type varchar(150) not null,

    file_size bigint not null,

    file_hash varchar(128),

    status varchar(40) not null default 'uploaded'
        check (
            status in (
                'uploaded',
                'sent_to_student',
                'accepted',
                'declined',
                'expired',
                'withdrawn',
                'superseded'
            )
        ),

    uploaded_by uuid not null
        references public.profiles(id),

    uploaded_at timestamptz not null default now(),

    sent_to_student_at timestamptz,

    student_decided_at timestamptz,

    student_decision_reason text,

    withdrawn_at timestamptz,

    withdrawn_by uuid
        references public.profiles(id),

    withdrawal_reason text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    deleted_at timestamptz,

    deleted_by uuid
        references public.profiles(id),

    check (
        annual_ctc is null
        or annual_ctc >= 0
    ),

    check (
        file_size > 0
    )
);


-- ------------------------------------------------------------
-- 6. OFFER CODE
-- ------------------------------------------------------------

create sequence if not exists
public.offer_code_seq;

create or replace function
public.generate_offer_code()
returns trigger
language plpgsql
as $$
begin

    if new.offer_code is null then
        new.offer_code :=
            'HRA-OFF-' ||
            to_char(now(), 'YYYY') ||
            '-' ||
            lpad(
                nextval(
                    'public.offer_code_seq'
                )::text,
                6,
                '0'
            );
    end if;

    return new;
end;
$$;

drop trigger if exists
set_offer_code
on public.offers;

create trigger
set_offer_code
before insert
on public.offers
for each row
execute function
public.generate_offer_code();


-- ------------------------------------------------------------
-- 7. ONE ACTIVE OFFER PER APPLICATION
-- ------------------------------------------------------------

create unique index if not exists
offers_one_active_application_idx
on public.offers(application_id)
where status in (
    'uploaded',
    'sent_to_student',
    'accepted'
);


-- ------------------------------------------------------------
-- 8. OFFER STATUS HISTORY
-- ------------------------------------------------------------

create table if not exists public.offer_status_history (
    id bigint generated always as identity primary key,

    offer_id uuid not null
        references public.offers(id)
        on delete cascade,

    old_status varchar(40),

    new_status varchar(40) not null,

    changed_by uuid
        references public.profiles(id),

    reason text,

    metadata jsonb,

    changed_at timestamptz not null default now()
);


-- ------------------------------------------------------------
-- 9. PLACEMENTS
-- ------------------------------------------------------------

create table if not exists public.placements (
    id uuid primary key default gen_random_uuid(),

    placement_code varchar(50) unique,

    application_id uuid not null unique
        references public.applications(id),

    offer_id uuid not null unique
        references public.offers(id),

    student_id uuid not null
        references public.student_profiles(id),

    job_id uuid not null
        references public.jobs(id),

    company_id uuid not null
        references public.companies(id),

    placed_designation varchar(255) not null,

    placed_department varchar(255),

    joining_location varchar(255),

    annual_ctc numeric(14,2),

    currency varchar(10) not null default 'INR',

    joining_date date,

    placement_status varchar(40) not null default 'placed'
        check (
            placement_status in (
                'placed',
                'joined',
                'joining_deferred',
                'offer_revoked',
                'candidate_declined_after_acceptance',
                'closed'
            )
        ),

    placed_by uuid not null
        references public.profiles(id),

    placed_at timestamptz not null default now(),

    joined_at timestamptz,

    closed_at timestamptz,

    closed_by uuid
        references public.profiles(id),

    closure_reason text,

    notes text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    check (
        annual_ctc is null
        or annual_ctc >= 0
    )
);


-- ------------------------------------------------------------
-- 10. PLACEMENT CODE
-- ------------------------------------------------------------

create sequence if not exists
public.placement_code_seq;

create or replace function
public.generate_placement_code()
returns trigger
language plpgsql
as $$
begin

    if new.placement_code is null then
        new.placement_code :=
            'HRA-PLC-' ||
            to_char(now(), 'YYYY') ||
            '-' ||
            lpad(
                nextval(
                    'public.placement_code_seq'
                )::text,
                6,
                '0'
            );
    end if;

    return new;
end;
$$;

drop trigger if exists
set_placement_code
on public.placements;

create trigger
set_placement_code
before insert
on public.placements
for each row
execute function
public.generate_placement_code();


-- ------------------------------------------------------------
-- 11. PLACEMENT STATUS HISTORY
-- ------------------------------------------------------------

create table if not exists public.placement_status_history (
    id bigint generated always as identity primary key,

    placement_id uuid not null
        references public.placements(id)
        on delete cascade,

    old_status varchar(40),

    new_status varchar(40) not null,

    changed_by uuid
        references public.profiles(id),

    reason text,

    metadata jsonb,

    changed_at timestamptz not null default now()
);


-- ------------------------------------------------------------
-- 12. APPLICATION COLUMNS
-- ------------------------------------------------------------

alter table public.applications
add column if not exists
selected_at timestamptz;

alter table public.applications
add column if not exists
offer_received_at timestamptz;

alter table public.applications
add column if not exists
placed_at timestamptz;


-- ------------------------------------------------------------
-- 13. UPDATED AT TRIGGERS
-- ------------------------------------------------------------

drop trigger if exists
interview_feedbacks_updated_at
on public.interview_feedbacks;

create trigger
interview_feedbacks_updated_at
before update
on public.interview_feedbacks
for each row
execute function public.set_updated_at();


drop trigger if exists
offers_updated_at
on public.offers;

create trigger
offers_updated_at
before update
on public.offers
for each row
execute function public.set_updated_at();


drop trigger if exists
placements_updated_at
on public.placements;

create trigger
placements_updated_at
before update
on public.placements
for each row
execute function public.set_updated_at();


-- ------------------------------------------------------------
-- 14. INDEXES
-- ------------------------------------------------------------

create index if not exists
interview_feedbacks_application_idx
on public.interview_feedbacks(application_id);

create index if not exists
interview_feedbacks_company_idx
on public.interview_feedbacks(company_id);

create index if not exists
interview_feedbacks_decision_idx
on public.interview_feedbacks(decision);

create index if not exists
interview_feedbacks_submitted_at_idx
on public.interview_feedbacks(submitted_at desc);

create index if not exists
offers_application_idx
on public.offers(application_id);

create index if not exists
offers_student_idx
on public.offers(student_id);

create index if not exists
offers_company_idx
on public.offers(company_id);

create index if not exists
offers_status_idx
on public.offers(status);

create index if not exists
placements_student_idx
on public.placements(student_id);

create index if not exists
placements_company_idx
on public.placements(company_id);

create index if not exists
placements_status_idx
on public.placements(placement_status);

create index if not exists
placements_placed_at_idx
on public.placements(placed_at desc);


-- ------------------------------------------------------------
-- 15. PRIVATE OFFER LETTER STORAGE BUCKET
-- ------------------------------------------------------------

insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'offer-letters',
    'offer-letters',
    false,
    10485760,
    array[
        'application/pdf'
    ]
)
on conflict (id)
do update set
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types =
        array[
            'application/pdf'
        ];


-- ------------------------------------------------------------
-- 16. RLS ENABLE
-- ------------------------------------------------------------

alter table public.interview_feedbacks
enable row level security;

alter table public.interview_feedback_revisions
enable row level security;

alter table public.offers
enable row level security;

alter table public.offer_status_history
enable row level security;

alter table public.placements
enable row level security;

alter table public.placement_status_history
enable row level security;


-- ------------------------------------------------------------
-- 17. CLIENT HR FEEDBACK READ
-- ------------------------------------------------------------

drop policy if exists
"Client HR views own feedbacks"
on public.interview_feedbacks;

create policy
"Client HR views own feedbacks"
on public.interview_feedbacks
for select
to authenticated
using (
    exists (
        select 1
        from public.client_hr_profiles chp
        where chp.user_id = auth.uid()
          and chp.company_id =
              interview_feedbacks.company_id
          and chp.is_active = true
    )
);


-- ------------------------------------------------------------
-- 18. STUDENT FEEDBACK READ
-- ------------------------------------------------------------

drop policy if exists
"Students view own feedbacks"
on public.interview_feedbacks;

create policy
"Students view own feedbacks"
on public.interview_feedbacks
for select
to authenticated
using (
    client_visible_to_student = true
    and exists (
        select 1
        from public.applications a
        join public.student_profiles sp
          on sp.id = a.student_id
        where a.id =
            interview_feedbacks.application_id
          and sp.user_id = auth.uid()
    )
);


-- ------------------------------------------------------------
-- 19. PLACEMENT TEAM FEEDBACK READ
-- ------------------------------------------------------------

drop policy if exists
"Placement team views feedbacks"
on public.interview_feedbacks;

create policy
"Placement team views feedbacks"
on public.interview_feedbacks
for select
to authenticated
using (
    public.is_admin()
    or public.has_role('placement_hr')
);


-- ------------------------------------------------------------
-- 20. STUDENT OFFER READ
-- ------------------------------------------------------------

drop policy if exists
"Students view own offers"
on public.offers;

create policy
"Students view own offers"
on public.offers
for select
to authenticated
using (
    exists (
        select 1
        from public.student_profiles sp
        where sp.id = offers.student_id
          and sp.user_id = auth.uid()
    )
);


-- ------------------------------------------------------------
-- 21. CLIENT HR OFFER READ
-- ------------------------------------------------------------

drop policy if exists
"Client HR views own company offers"
on public.offers;

create policy
"Client HR views own company offers"
on public.offers
for select
to authenticated
using (
    exists (
        select 1
        from public.client_hr_profiles chp
        where chp.user_id = auth.uid()
          and chp.company_id = offers.company_id
          and chp.is_active = true
    )
);


-- ------------------------------------------------------------
-- 22. PLACEMENT TEAM OFFER READ
-- ------------------------------------------------------------

drop policy if exists
"Placement team views offers"
on public.offers;

create policy
"Placement team views offers"
on public.offers
for select
to authenticated
using (
    public.is_admin()
    or public.has_role('placement_hr')
);


-- ------------------------------------------------------------
-- 23. STUDENT PLACEMENT READ
-- ------------------------------------------------------------

drop policy if exists
"Students view own placements"
on public.placements;

create policy
"Students view own placements"
on public.placements
for select
to authenticated
using (
    exists (
        select 1
        from public.student_profiles sp
        where sp.id = placements.student_id
          and sp.user_id = auth.uid()
    )
);


-- ------------------------------------------------------------
-- 24. CLIENT HR PLACEMENT READ
-- ------------------------------------------------------------

drop policy if exists
"Client HR views own company placements"
on public.placements;

create policy
"Client HR views own company placements"
on public.placements
for select
to authenticated
using (
    exists (
        select 1
        from public.client_hr_profiles chp
        where chp.user_id = auth.uid()
          and chp.company_id =
              placements.company_id
          and chp.is_active = true
    )
);


-- ------------------------------------------------------------
-- 25. PLACEMENT TEAM PLACEMENT READ
-- ------------------------------------------------------------

drop policy if exists
"Placement team views placements"
on public.placements;

create policy
"Placement team views placements"
on public.placements
for select
to authenticated
using (
    public.is_admin()
    or public.has_role('placement_hr')
);


-- ------------------------------------------------------------
-- 26. SUBMIT INTERVIEW FEEDBACK RPC
-- ------------------------------------------------------------

create or replace function
public.submit_interview_feedback(
    p_interview_id uuid,
    p_rating numeric,
    p_decision varchar,
    p_reason_code varchar default null,
    p_comments text default null,
    p_visible_to_student boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_actor uuid;
    v_interview public.interviews%rowtype;
    v_feedback_id uuid;
    v_student_user_id uuid;
    v_old_application_status varchar(40);
begin

    v_actor := auth.uid();

    if v_actor is null then
        raise exception 'Authentication required';
    end if;

    if p_rating is not null
       and (
           p_rating < 1
           or p_rating > 5
       ) then
        raise exception
        'Rating must be between 1 and 5';
    end if;

    if p_decision not in (
        'selected',
        'rejected',
        'on_hold'
    ) then
        raise exception
        'Invalid feedback decision';
    end if;

    if p_decision = 'rejected'
       and (
           p_comments is null
           or length(trim(p_comments)) = 0
       ) then
        raise exception
        'Rejection comments are required';
    end if;

    select *
    into v_interview
    from public.interviews
    where id = p_interview_id
    for update;

    if v_interview.id is null then
        raise exception
        'Interview not found';
    end if;

    if v_interview.status <> 'completed' then
        raise exception
        'Interview must be completed before feedback';
    end if;

    if exists (
        select 1
        from public.interview_feedbacks
        where interview_id = p_interview_id
    ) then
        raise exception
        'Feedback already exists for this interview';
    end if;

    if not exists (
        select 1
        from public.client_hr_profiles chp
        where chp.user_id = v_actor
          and chp.company_id =
              v_interview.company_id
          and chp.is_active = true
    )
    and not public.is_admin()
    and not public.has_role('placement_hr')
    then
        raise exception
        'Not authorized';
    end if;

    select status
    into v_old_application_status
    from public.applications
    where id =
        v_interview.application_id
    for update;

    select sp.user_id
    into v_student_user_id
    from public.applications a
    join public.student_profiles sp
      on sp.id = a.student_id
    where a.id =
        v_interview.application_id;

    insert into public.interview_feedbacks (
        interview_id,
        application_id,
        submission_candidate_id,
        company_id,
        rating,
        decision,
        reason_code,
        comments,
        client_visible_to_student,
        feedback_due_at,
        feedback_status,
        submitted_by,
        submitted_at
    )
    values (
        p_interview_id,
        v_interview.application_id,
        v_interview.submission_candidate_id,
        v_interview.company_id,
        p_rating,
        p_decision,
        p_reason_code,
        p_comments,
        p_visible_to_student,
        v_interview.completed_at + interval '24 hours',
        'submitted',
        v_actor,
        now()
    )
    returning id
    into v_feedback_id;

    if p_decision = 'selected' then

        update public.applications
        set
            status = 'selected',
            selected_at = now(),
            updated_at = now()
        where id =
            v_interview.application_id;

    elsif p_decision = 'rejected' then

        update public.applications
        set
            status = 'rejected_interview',
            rejection_reason = p_comments,
            updated_at = now()
        where id =
            v_interview.application_id;

    else

        update public.applications
        set
            status = 'on_hold',
            updated_at = now()
        where id =
            v_interview.application_id;

    end if;

    insert into public.application_status_history (
        application_id,
        old_status,
        new_status,
        changed_by,
        reason,
        metadata
    )
    values (
        v_interview.application_id,
        v_old_application_status,
        case
            when p_decision = 'selected'
                then 'selected'
            when p_decision = 'rejected'
                then 'rejected_interview'
            else 'on_hold'
        end,
        v_actor,
        p_comments,
        jsonb_build_object(
            'feedback_id',
            v_feedback_id,
            'interview_id',
            p_interview_id,
            'decision',
            p_decision,
            'rating',
            p_rating
        )
    );

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
        'INTERVIEW_FEEDBACK_SUBMITTED',
        'in_app',
        v_student_user_id,
        'feedback',
        v_feedback_id,
        jsonb_build_object(
            'feedback_id',
            v_feedback_id,
            'application_id',
            v_interview.application_id,
            'decision',
            p_decision,
            'rating',
            p_rating
        ),
        'feedback:' ||
        v_feedback_id::text ||
        ':student:inapp'
    );

    return v_feedback_id;

end;
$$;


-- ------------------------------------------------------------
-- 27. REGISTER OFFER RPC
-- File is already uploaded privately by server.
-- ------------------------------------------------------------

create or replace function
public.register_offer(
    p_application_id uuid,
    p_feedback_id uuid,
    p_designation varchar,
    p_department varchar,
    p_employment_type varchar,
    p_joining_location varchar,
    p_annual_ctc numeric,
    p_currency varchar,
    p_joining_date date,
    p_offer_date date,
    p_offer_valid_until date,
    p_probation_period_months integer,
    p_notice_buyout_available boolean,
    p_notes text,
    p_bucket_name varchar,
    p_storage_path text,
    p_original_file_name text,
    p_mime_type varchar,
    p_file_size bigint,
    p_file_hash varchar
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_actor uuid;
    v_application public.applications%rowtype;
    v_feedback public.interview_feedbacks%rowtype;
    v_submission_candidate_id uuid;
    v_company_id uuid;
    v_job_id uuid;
    v_student_id uuid;
    v_student_user_id uuid;
    v_offer_id uuid;
begin

    v_actor := auth.uid();

    if not (
        public.is_admin()
        or public.has_role('placement_hr')
    ) then
        raise exception
        'Only Placement HR/Admin can register an offer';
    end if;

    select *
    into v_application
    from public.applications
    where id = p_application_id
    for update;

    if v_application.id is null then
        raise exception
        'Application not found';
    end if;

    if v_application.status <> 'selected' then
        raise exception
        'Candidate must be selected before offer upload';
    end if;

    select *
    into v_feedback
    from public.interview_feedbacks
    where id = p_feedback_id;

    if v_feedback.id is null
       or v_feedback.application_id <> p_application_id
       or v_feedback.decision <> 'selected'
    then
        raise exception
        'Selected interview feedback is required';
    end if;

    if exists (
        select 1
        from public.offers
        where application_id = p_application_id
          and status in (
              'uploaded',
              'sent_to_student',
              'accepted'
          )
    ) then
        raise exception
        'Active offer already exists';
    end if;

    select
        sc.id,
        s.company_id,
        s.job_id
    into
        v_submission_candidate_id,
        v_company_id,
        v_job_id
    from public.submission_candidates sc
    join public.submissions s
      on s.id = sc.submission_id
    where sc.application_id =
        p_application_id
      and sc.status <> 'withdrawn'
    order by sc.created_at desc
    limit 1;

    if v_submission_candidate_id is null then
        raise exception
        'Client submission not found';
    end if;

    v_student_id :=
        v_application.student_id;

    select user_id
    into v_student_user_id
    from public.student_profiles
    where id = v_student_id;

    insert into public.offers (
        application_id,
        submission_candidate_id,
        interview_feedback_id,
        student_id,
        job_id,
        company_id,
        designation,
        department,
        employment_type,
        joining_location,
        annual_ctc,
        currency,
        joining_date,
        offer_date,
        offer_valid_until,
        probation_period_months,
        notice_buyout_available,
        notes,
        bucket_name,
        storage_path,
        original_file_name,
        mime_type,
        file_size,
        file_hash,
        status,
        uploaded_by
    )
    values (
        p_application_id,
        v_submission_candidate_id,
        p_feedback_id,
        v_student_id,
        v_job_id,
        v_company_id,
        p_designation,
        p_department,
        p_employment_type,
        p_joining_location,
        p_annual_ctc,
        coalesce(p_currency, 'INR'),
        p_joining_date,
        p_offer_date,
        p_offer_valid_until,
        p_probation_period_months,
        p_notice_buyout_available,
        p_notes,
        p_bucket_name,
        p_storage_path,
        p_original_file_name,
        p_mime_type,
        p_file_size,
        p_file_hash,
        'sent_to_student',
        v_actor
    )
    returning id
    into v_offer_id;

    update public.offers
    set sent_to_student_at = now()
    where id = v_offer_id;

    update public.applications
    set
        status = 'offer_received',
        offer_received_at = now(),
        updated_at = now()
    where id =
        p_application_id;

    insert into public.offer_status_history (
        offer_id,
        old_status,
        new_status,
        changed_by
    )
    values (
        v_offer_id,
        null,
        'sent_to_student',
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
        p_application_id,
        'selected',
        'offer_received',
        v_actor,
        jsonb_build_object(
            'offer_id',
            v_offer_id
        )
    );

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
        'OFFER_RECEIVED',
        'in_app',
        v_student_user_id,
        'offer',
        v_offer_id,
        jsonb_build_object(
            'offer_id',
            v_offer_id,
            'application_id',
            p_application_id,
            'designation',
            p_designation,
            'annual_ctc',
            p_annual_ctc,
            'currency',
            p_currency,
            'joining_date',
            p_joining_date
        ),
        'offer:' ||
        v_offer_id::text ||
        ':student:inapp'
    );

    return v_offer_id;

end;
$$;


-- ------------------------------------------------------------
-- 28. STUDENT OFFER DECISION RPC
-- ------------------------------------------------------------

create or replace function
public.student_decide_offer(
    p_offer_id uuid,
    p_decision varchar,
    p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_actor uuid;
    v_offer public.offers%rowtype;
    v_student_user_id uuid;
    v_placement_id uuid;
begin

    v_actor := auth.uid();

    if p_decision not in (
        'accepted',
        'declined'
    ) then
        raise exception
        'Invalid offer decision';
    end if;

    select *
    into v_offer
    from public.offers
    where id = p_offer_id
    for update;

    if v_offer.id is null then
        raise exception
        'Offer not found';
    end if;

    select user_id
    into v_student_user_id
    from public.student_profiles
    where id =
        v_offer.student_id;

    if v_student_user_id <> v_actor then
        raise exception
        'You cannot decide another student offer';
    end if;

    if v_offer.status not in (
        'uploaded',
        'sent_to_student'
    ) then
        raise exception
        'Offer cannot be decided in current state';
    end if;

    if p_decision = 'declined'
       and (
           p_reason is null
           or length(trim(p_reason)) = 0
       ) then
        raise exception
        'Reason is required when declining an offer';
    end if;

    if p_decision = 'accepted' then

        update public.offers
        set
            status = 'accepted',
            student_decided_at = now(),
            student_decision_reason = p_reason,
            updated_at = now()
        where id = p_offer_id;

        insert into public.offer_status_history (
            offer_id,
            old_status,
            new_status,
            changed_by,
            reason
        )
        values (
            p_offer_id,
            v_offer.status,
            'accepted',
            v_actor,
            p_reason
        );

        if exists (
            select 1
            from public.placements
            where application_id =
                v_offer.application_id
        ) then
            raise exception
            'Placement already exists';
        end if;

        insert into public.placements (
            application_id,
            offer_id,
            student_id,
            job_id,
            company_id,
            placed_designation,
            placed_department,
            joining_location,
            annual_ctc,
            currency,
            joining_date,
            placement_status,
            placed_by,
            placed_at
        )
        values (
            v_offer.application_id,
            v_offer.id,
            v_offer.student_id,
            v_offer.job_id,
            v_offer.company_id,
            v_offer.designation,
            v_offer.department,
            v_offer.joining_location,
            v_offer.annual_ctc,
            v_offer.currency,
            v_offer.joining_date,
            'placed',
            v_actor,
            now()
        )
        returning id
        into v_placement_id;

        update public.applications
        set
            status = 'placed',
            placed_at = now(),
            updated_at = now()
        where id =
            v_offer.application_id;

        insert into public.application_status_history (
            application_id,
            old_status,
            new_status,
            changed_by,
            metadata
        )
        values (
            v_offer.application_id,
            'offer_received',
            'placed',
            v_actor,
            jsonb_build_object(
                'offer_id',
                v_offer.id,
                'placement_id',
                v_placement_id
            )
        );

        insert into public.placement_status_history (
            placement_id,
            old_status,
            new_status,
            changed_by
        )
        values (
            v_placement_id,
            null,
            'placed',
            v_actor
        );

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
            'CANDIDATE_PLACED',
            'in_app',
            ur.user_id,
            'placement',
            v_placement_id,
            jsonb_build_object(
                'placement_id',
                v_placement_id,
                'application_id',
                v_offer.application_id,
                'student_id',
                v_offer.student_id,
                'company_id',
                v_offer.company_id
            ),
            'placement:' ||
            v_placement_id::text ||
            ':admin:' ||
            ur.user_id::text
        from public.user_roles ur
        join public.roles r
          on r.id = ur.role_id
        where r.name in (
            'admin',
            'super_admin',
            'placement_hr'
        );

        return v_placement_id;

    else

        update public.offers
        set
            status = 'declined',
            student_decided_at = now(),
            student_decision_reason = p_reason,
            updated_at = now()
        where id = p_offer_id;

        update public.applications
        set
            status = 'selected',
            updated_at = now()
        where id =
            v_offer.application_id;

        insert into public.offer_status_history (
            offer_id,
            old_status,
            new_status,
            changed_by,
            reason
        )
        values (
            p_offer_id,
            v_offer.status,
            'declined',
            v_actor,
            p_reason
        );

        insert into public.application_status_history (
            application_id,
            old_status,
            new_status,
            changed_by,
            reason
        )
        values (
            v_offer.application_id,
            'offer_received',
            'selected',
            v_actor,
            p_reason
        );

        return null;

    end if;

end;
$$;


-- ------------------------------------------------------------
-- 29. MARK PLACEMENT JOINED RPC
-- ------------------------------------------------------------

create or replace function
public.mark_placement_joined(
    p_placement_id uuid,
    p_joined_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_actor uuid;
    v_placement public.placements%rowtype;
begin

    v_actor := auth.uid();

    if not (
        public.is_admin()
        or public.has_role('placement_hr')
    ) then
        raise exception
        'Not authorized';
    end if;

    select *
    into v_placement
    from public.placements
    where id = p_placement_id
    for update;

    if v_placement.id is null then
        raise exception
        'Placement not found';
    end if;

    if v_placement.placement_status not in (
        'placed',
        'joining_deferred'
    ) then
        raise exception
        'Placement cannot be marked joined';
    end if;

    update public.placements
    set
        placement_status = 'joined',
        joined_at = p_joined_at,
        updated_at = now()
    where id = p_placement_id;

    insert into public.placement_status_history (
        placement_id,
        old_status,
        new_status,
        changed_by
    )
    values (
        p_placement_id,
        v_placement.placement_status,
        'joined',
        v_actor
    );

end;
$$;


-- ------------------------------------------------------------
-- 30. CLOSE PLACEMENT RPC
-- ------------------------------------------------------------

create or replace function
public.close_placement(
    p_placement_id uuid,
    p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_actor uuid;
    v_placement public.placements%rowtype;
begin

    v_actor := auth.uid();

    if not (
        public.is_admin()
        or public.has_role('placement_hr')
    ) then
        raise exception
        'Not authorized';
    end if;

    if p_reason is null
       or length(trim(p_reason)) = 0
    then
        raise exception
        'Closure reason is required';
    end if;

    select *
    into v_placement
    from public.placements
    where id = p_placement_id
    for update;

    if v_placement.id is null then
        raise exception
        'Placement not found';
    end if;

    if v_placement.placement_status = 'closed' then
        raise exception
        'Placement already closed';
    end if;

    update public.placements
    set
        placement_status = 'closed',
        closed_at = now(),
        closed_by = v_actor,
        closure_reason = p_reason,
        updated_at = now()
    where id = p_placement_id;

    insert into public.placement_status_history (
        placement_id,
        old_status,
        new_status,
        changed_by,
        reason
    )
    values (
        p_placement_id,
        v_placement.placement_status,
        'closed',
        v_actor,
        p_reason
    );

end;
$$;


-- ------------------------------------------------------------
-- 31. EXECUTE PERMISSIONS
-- ------------------------------------------------------------

revoke all on function
public.submit_interview_feedback(
    uuid,
    numeric,
    varchar,
    varchar,
    text,
    boolean
)
from public;

grant execute on function
public.submit_interview_feedback(
    uuid,
    numeric,
    varchar,
    varchar,
    text,
    boolean
)
to authenticated;


revoke all on function
public.register_offer(
    uuid,
    uuid,
    varchar,
    varchar,
    varchar,
    varchar,
    numeric,
    varchar,
    date,
    date,
    date,
    integer,
    boolean,
    text,
    varchar,
    text,
    text,
    varchar,
    bigint,
    varchar
)
from public;

grant execute on function
public.register_offer(
    uuid,
    uuid,
    varchar,
    varchar,
    varchar,
    varchar,
    numeric,
    varchar,
    date,
    date,
    date,
    integer,
    boolean,
    text,
    varchar,
    text,
    text,
    varchar,
    bigint,
    varchar
)
to authenticated;


revoke all on function
public.student_decide_offer(
    uuid,
    varchar,
    text
)
from public;

grant execute on function
public.student_decide_offer(
    uuid,
    varchar,
    text
)
to authenticated;


revoke all on function
public.mark_placement_joined(
    uuid,
    timestamptz
)
from public;

grant execute on function
public.mark_placement_joined(
    uuid,
    timestamptz
)
to authenticated;


revoke all on function
public.close_placement(
    uuid,
    text
)
from public;

grant execute on function
public.close_placement(
    uuid,
    text
)
to authenticated;