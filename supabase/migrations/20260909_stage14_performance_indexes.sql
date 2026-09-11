begin;


create index if not exists
applications_effective_match_verified_idx

on public.applications (
    job_id,
    (
        coalesce(
            verified_match_score,
            match_score
        )
    ) desc
)

where status =
      'verified';


create index if not exists
applications_student_created_idx

on public.applications (
    student_id,
    created_at desc
);


create index if not exists
submissions_company_submitted_idx

on public.submissions (
    company_id,
    submitted_at desc
)

where status <>
      'cancelled';


create index if not exists
submission_candidates_submission_status_idx

on public.submission_candidates (
    submission_id,
    status
);


create index if not exists
interviews_company_schedule_status_idx

on public.interviews (
    company_id,
    scheduled_at,
    status
)

where deleted_at
      is null;


create index if not exists
mock_interviews_application_completed_idx

on public.mock_interviews (
    application_id,
    completed_at desc
)

where status =
      'completed';


create index if not exists
offers_student_status_uploaded_idx

on public.offers (
    student_id,
    status,
    uploaded_at desc
)

where deleted_at
      is null;


create index if not exists
placements_company_placed_idx

on public.placements (
    company_id,
    placed_at desc
);


create index if not exists
notification_outbox_pending_worker_idx

on public.notification_outbox (
    scheduled_for,
    id
)

where status =
      'pending';


create index if not exists
notifications_unread_user_idx

on public.notifications (
    user_id,
    created_at desc
)

where is_read =
      false;


insert into
public.system_schema_versions (
    version,
    description
)
values (
    '14.0',
    'Performance indexes and load-test readiness'
)
on conflict (
    version
)
do nothing;


commit;