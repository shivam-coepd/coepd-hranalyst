-- ============================================================
-- HRANALYST PLACEMENT WING
-- STAGE 12
-- NOTIFICATIONS + ANALYTICS + REPORTING
-- ============================================================


-- ------------------------------------------------------------
-- 1. IN-APP NOTIFICATIONS
-- ------------------------------------------------------------

create table if not exists public.notifications (
    id uuid primary key
        default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    event_type varchar(100)
        not null,

    title varchar(255)
        not null,

    message text
        not null,

    entity_type varchar(100),

    entity_id uuid,

    action_url text,

    severity varchar(30)
        not null default 'info'
        check (
            severity in (
                'info',
                'success',
                'warning',
                'error'
            )
        ),

    is_read boolean
        not null default false,

    read_at timestamptz,

    created_at timestamptz
        not null default now()
);

create index if not exists
notifications_user_created_idx
on public.notifications(
    user_id,
    created_at desc
);

create index if not exists
notifications_user_unread_idx
on public.notifications(
    user_id,
    is_read,
    created_at desc
);

create index if not exists
notifications_entity_idx
on public.notifications(
    entity_type,
    entity_id
);


-- ------------------------------------------------------------
-- 2. DELIVERY LOGS
-- ------------------------------------------------------------

create table if not exists
public.notification_delivery_logs (
    id uuid primary key
        default gen_random_uuid(),

    outbox_id uuid not null
        references public.notification_outbox(id)
        on delete cascade,

    event_type varchar(100)
        not null,

    channel varchar(30)
        not null,

    recipient_user_id uuid
        references public.profiles(id),

    recipient_address text,

    provider varchar(100),

    provider_message_id text,

    status varchar(30)
        not null
        check (
            status in (
                'sent',
                'failed',
                'skipped'
            )
        ),

    error_message text,

    metadata jsonb
        not null default '{}'::jsonb,

    delivered_at timestamptz
        not null default now()
);

create index if not exists
notification_delivery_outbox_idx
on public.notification_delivery_logs(
    outbox_id
);

create index if not exists
notification_delivery_event_idx
on public.notification_delivery_logs(
    event_type,
    delivered_at desc
);


-- ------------------------------------------------------------
-- 3. OPERATIONAL ALERTS
-- ------------------------------------------------------------

create table if not exists
public.operational_alerts (
    id uuid primary key
        default gen_random_uuid(),

    alert_type varchar(100)
        not null,

    entity_type varchar(100)
        not null,

    entity_id uuid
        not null,

    severity varchar(30)
        not null default 'warning'
        check (
            severity in (
                'info',
                'warning',
                'critical'
            )
        ),

    title varchar(255)
        not null,

    description text,

    status varchar(30)
        not null default 'open'
        check (
            status in (
                'open',
                'acknowledged',
                'resolved',
                'dismissed'
            )
        ),

    assigned_to uuid
        references public.profiles(id),

    due_at timestamptz,

    acknowledged_at timestamptz,

    acknowledged_by uuid
        references public.profiles(id),

    resolved_at timestamptz,

    resolved_by uuid
        references public.profiles(id),

    resolution_notes text,

    created_at timestamptz
        not null default now(),

    updated_at timestamptz
        not null default now()
);

create unique index if not exists
operational_alert_active_unique_idx
on public.operational_alerts(
    alert_type,
    entity_type,
    entity_id
)
where status in (
    'open',
    'acknowledged'
);

create index if not exists
operational_alert_status_idx
on public.operational_alerts(
    status,
    severity,
    created_at desc
);


-- ------------------------------------------------------------
-- 4. UPDATE TRIGGER
-- ------------------------------------------------------------

drop trigger if exists
operational_alert_updated_at
on public.operational_alerts;

create trigger
operational_alert_updated_at
before update
on public.operational_alerts
for each row
execute function public.set_updated_at();


-- ------------------------------------------------------------
-- 5. RLS
-- ------------------------------------------------------------

alter table public.notifications
enable row level security;

alter table public.notification_delivery_logs
enable row level security;

alter table public.operational_alerts
enable row level security;


-- ------------------------------------------------------------
-- 6. STUDENT/USER NOTIFICATION ACCESS
-- ------------------------------------------------------------

drop policy if exists
"Users view own notifications"
on public.notifications;

create policy
"Users view own notifications"
on public.notifications
for select
to authenticated
using (
    user_id = auth.uid()
);


drop policy if exists
"Users update own notifications"
on public.notifications;

create policy
"Users update own notifications"
on public.notifications
for update
to authenticated
using (
    user_id = auth.uid()
)
with check (
    user_id = auth.uid()
);


-- ------------------------------------------------------------
-- 7. ADMIN DELIVERY LOG ACCESS
-- ------------------------------------------------------------

drop policy if exists
"Admin views notification delivery logs"
on public.notification_delivery_logs;

create policy
"Admin views notification delivery logs"
on public.notification_delivery_logs
for select
to authenticated
using (
    public.is_admin()
);


-- ------------------------------------------------------------
-- 8. PLACEMENT/ADMIN ALERT ACCESS
-- ------------------------------------------------------------

drop policy if exists
"Placement team views operational alerts"
on public.operational_alerts;

create policy
"Placement team views operational alerts"
on public.operational_alerts
for select
to authenticated
using (
    public.is_admin()
    or
    public.has_role('placement_hr')
);


-- ------------------------------------------------------------
-- 9. CLAIM OUTBOX RPC
-- SERVICE ROLE ONLY
-- ------------------------------------------------------------

drop policy if exists
"Placement team views operational alerts"
on public.operational_alerts;

create policy
"Placement team views operational alerts"
on public.operational_alerts
for select
to authenticated
using (
    public.is_admin()
    or
    public.has_role('placement_hr')
);




-- ------------------------------------------------------------
-- 10. MARK OUTBOX SENT
-- ------------------------------------------------------------

create or replace function
public.mark_notification_sent(
    p_outbox_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin

    update public.notification_outbox

    set
        status = 'sent',
        sent_at = now(),
        error_message = null,
        updated_at = now()

    where id = p_outbox_id;

end;
$$;

revoke all
on function
public.mark_notification_sent(uuid)
from public;

revoke all
on function
public.mark_notification_sent(uuid)
from authenticated;

grant execute
on function
public.mark_notification_sent(uuid)
to service_role;


-- ------------------------------------------------------------
-- 11. MARK OUTBOX FAILED
-- ------------------------------------------------------------

create or replace function
public.mark_notification_failed(
    p_outbox_id uuid,
    p_error text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin

    update public.notification_outbox

    set
        status =
            case
                when attempts >= max_attempts
                then 'failed'
                else 'pending'
            end,

        failed_at =
            case
                when attempts >= max_attempts
                then now()
                else failed_at
            end,

        error_message =
            left(
                p_error,
                5000
            ),

        scheduled_for =
            case
                when attempts >= max_attempts
                then scheduled_for

                else
                    now()
                    +
                    (
                        interval '5 minutes'
                        *
                        greatest(
                            attempts,
                            1
                        )
                    )
            end,

        processing_started_at = null,

        updated_at = now()

    where id =
        p_outbox_id;

end;
$$;

revoke all
on function
public.mark_notification_failed(uuid, text)
from public;

revoke all
on function
public.mark_notification_failed(uuid, text)
from authenticated;

grant execute
on function
public.mark_notification_failed(uuid, text)
to service_role;


-- ------------------------------------------------------------
-- 12. RECOVER STUCK PROCESSING JOBS
-- ------------------------------------------------------------

create or replace function
public.recover_stuck_notifications()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    v_count integer;
begin

    update public.notification_outbox

    set
        status = 'pending',
        processing_started_at = null,
        scheduled_for = now(),
        error_message =
            'Recovered stale processing job',
        updated_at = now()

    where status = 'processing'

      and processing_started_at <
          now()
          - interval '15 minutes';

    get diagnostics
        v_count = row_count;

    return v_count;
end;
$$;

revoke all
on function
public.recover_stuck_notifications()
from public;

revoke all
on function
public.recover_stuck_notifications()
from authenticated;

grant execute
on function
public.recover_stuck_notifications()
to service_role;


-- ============================================================
-- ANALYTICS
-- ============================================================


-- ------------------------------------------------------------
-- 13. APPLICATION FUNNEL VIEW
-- ------------------------------------------------------------

create or replace view
public.analytics_application_funnel
with (security_invoker = true)
as

select

    count(*) as total_applications,

    count(*) filter (
        where status in (
            'verified',
            'submitted_to_client',
            'shortlisted',
            'mock_scheduled',
            'mock_completed',
            'interview_scheduled',
            'interview_completed',
            'selected',
            'offer_received',
            'placed'
        )
    ) as verified_or_beyond,

    count(*) filter (
        where submitted_to_client_at
        is not null
    ) as submitted_to_client,

    count(*) filter (
        where shortlisted_at
        is not null
    ) as shortlisted,

    count(*) filter (
        where status in (
            'interview_scheduled',
            'interview_completed',
            'selected',
            'offer_received',
            'placed'
        )
    ) as interview_stage,

    count(*) filter (
        where selected_at
        is not null
    ) as selected,

    count(*) filter (
        where offer_received_at
        is not null
    ) as offer_received,

    count(*) filter (
        where placed_at
        is not null
    ) as placed

from public.applications;


-- ------------------------------------------------------------
-- 14. FEEDBACK SLA VIEW
-- ------------------------------------------------------------

create or replace view
public.analytics_feedback_sla
with (security_invoker = true)
as

select
    i.id as interview_id,

    i.application_id,

    i.company_id,

    i.completed_at,

    f.id as feedback_id,

    f.submitted_at,

    i.completed_at
        + interval '24 hours'
        as feedback_due_at,

    case

        when i.completed_at
             is null
        then 'not_applicable'

        when f.id is null
             and now() >
             i.completed_at
             + interval '48 hours'
        then 'escalation'

        when f.id is null
             and now() >
             i.completed_at
             + interval '24 hours'
        then 'overdue'

        when f.id is null
        then 'pending'

        when f.submitted_at <=
             i.completed_at
             + interval '24 hours'
        then 'within_sla'

        else 'late'

    end as sla_status,

    case

        when f.submitted_at
             is not null

        then extract(
            epoch from (
                f.submitted_at
                -
                i.completed_at
            )
        ) / 3600

        else extract(
            epoch from (
                now()
                -
                i.completed_at
            )
        ) / 3600

    end as elapsed_hours

from public.interviews i

left join public.interview_feedbacks f
  on f.interview_id = i.id

where i.status = 'completed';


-- ------------------------------------------------------------
-- 15. SUBMISSION SLA VIEW
-- ------------------------------------------------------------

create or replace view
public.analytics_submission_sla
with (security_invoker = true)
as

select
    s.id as submission_id,

    s.job_id,

    s.company_id,

    j.created_at
        as job_created_at,

    s.submitted_at,

    extract(
        epoch from (
            s.submitted_at
            -
            j.created_at
        )
    ) / 3600
        as turnaround_hours,

    case
        when
            s.submitted_at
            <=
            j.created_at
            +
            interval '24 hours'
        then true
        else false
    end as within_24h

from public.submissions s

join public.jobs j
  on j.id = s.job_id

where s.status <>
      'cancelled'

  and s.submitted_at
      is not null;


-- ------------------------------------------------------------
-- 16. PLACEMENT SUMMARY VIEW
-- ------------------------------------------------------------

create or replace view
public.analytics_placement_summary
with (security_invoker = true)
as

select

    count(*) as total_placements,

    count(*) filter (
        where placement_status =
              'placed'
    ) as placed_pending_joining,

    count(*) filter (
        where placement_status =
              'joined'
    ) as joined,

    count(*) filter (
        where placement_status =
              'closed'
    ) as closed,

    coalesce(
        avg(
            annual_ctc
        ) filter (
            where currency = 'INR'
        ),
        0
    ) as average_ctc_inr,

    coalesce(
        max(
            annual_ctc
        ) filter (
            where currency = 'INR'
        ),
        0
    ) as highest_ctc_inr,

    coalesce(
        sum(
            annual_ctc
        ) filter (
            where currency = 'INR'
        ),
        0
    ) as total_ctc_inr

from public.placements;


-- ------------------------------------------------------------
-- 17. CLIENT COMPANY ANALYTICS FUNCTION
-- ------------------------------------------------------------

create or replace function
public.get_client_company_analytics()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user uuid;
    v_company uuid;
    v_result jsonb;
begin

    v_user := auth.uid();

    select company_id
    into v_company

    from public.client_hr_profiles

    where user_id = v_user
      and is_active = true;

    if v_company is null then
        raise exception
        'Active Client HR profile required';
    end if;

    select jsonb_build_object(

        'open_jobs',
        (
            select count(*)
            from public.jobs
            where company_id =
                  v_company
              and status in (
                  'published',
                  'paused'
              )
              and deleted_at
                  is null
        ),

        'submitted_candidates',
        (
            select count(*)

            from public.submission_candidates sc

            join public.submissions s
              on s.id =
                 sc.submission_id

            where s.company_id =
                  v_company

              and sc.status <>
                  'withdrawn'
        ),

        'shortlisted',
        (
            select count(*)

            from public.submission_candidates sc

            join public.submissions s
              on s.id =
                 sc.submission_id

            where s.company_id =
                  v_company

              and sc.status =
                  'shortlisted'
        ),

        'interviews',
        (
            select count(*)
            from public.interviews
            where company_id =
                  v_company

              and status in (
                  'scheduled',
                  'confirmed',
                  'rescheduled',
                  'in_progress'
              )
        ),

        'selected',
        (
            select count(*)
            from public.interview_feedbacks
            where company_id =
                  v_company
              and decision =
                  'selected'
        ),

        'placements',
        (
            select count(*)
            from public.placements
            where company_id =
                  v_company
        )

    )
    into v_result;

    return v_result;

end;
$$;

revoke all
on function
public.get_client_company_analytics()
from public;

grant execute
on function
public.get_client_company_analytics()
to authenticated;


-- ------------------------------------------------------------
-- 18. MARK NOTIFICATION READ
-- ------------------------------------------------------------

create or replace function
public.mark_notification_read(
    p_notification_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin

    update public.notifications

    set
        is_read = true,
        read_at = coalesce(
            read_at,
            now()
        )

    where id =
        p_notification_id

      and user_id =
          auth.uid();

end;
$$;

revoke all
on function
public.mark_notification_read(uuid)
from public;

grant execute
on function
public.mark_notification_read(uuid)
to authenticated;


-- ------------------------------------------------------------
-- 19. MARK ALL READ
-- ------------------------------------------------------------

create or replace function
public.mark_all_notifications_read()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
    v_count integer;
begin

    update public.notifications

    set
        is_read = true,
        read_at = now()

    where user_id =
          auth.uid()

      and is_read = false;

    get diagnostics
        v_count =
        row_count;

    return v_count;

end;
$$;

revoke all
on function
public.mark_all_notifications_read()
from public;

grant execute
on function
public.mark_all_notifications_read()
to authenticated;


-- ------------------------------------------------------------
-- 20. ENABLE REALTIME
-- ------------------------------------------------------------

do $$
begin

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

        alter publication
        supabase_realtime
        add table
        public.notifications;

    end if;

end;
$$;