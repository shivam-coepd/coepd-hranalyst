-- ============================================================
-- HRANALYST PERFORMANCE QUERY PLANS
-- ============================================================


-- ------------------------------------------------------------
-- JOB FEED
-- ------------------------------------------------------------

explain (
    analyze,
    buffers,
    verbose,
    format text
)

select
    j.id,
    j.job_code,
    j.job_title,
    j.role_type,
    j.location,
    j.workplace_type,
    j.published_at

from public.jobs j

where j.status =
      'published'

  and j.deleted_at
      is null

order by
    j.published_at desc,
    j.id desc

limit 25;


-- ------------------------------------------------------------
-- VERIFICATION QUEUE
-- ------------------------------------------------------------

explain (
    analyze,
    buffers,
    verbose,
    format text
)

select
    a.id,
    a.job_id,
    a.student_id,
    a.match_score,
    a.ats_score,
    a.verification_due_at,
    a.created_at

from public.applications a

where a.status =
      'verification_pending'

order by
    a.verification_due_at asc nulls last,
    a.created_at asc

limit 50;


-- ------------------------------------------------------------
-- VERIFIED CANDIDATE POOL
-- ------------------------------------------------------------

explain (
    analyze,
    buffers,
    verbose,
    format text
)

select
    a.id,

    coalesce(
        a.verified_match_score,
        a.match_score
    )
        as effective_match_score

from public.applications a

where a.job_id =
      (
          select id
          from public.jobs
          where status =
                'published'
          limit 1
      )

  and a.status =
      'verified'

order by
    coalesce(
        a.verified_match_score,
        a.match_score
    ) desc

limit 50;


-- ------------------------------------------------------------
-- STUDENT APPLICATION HISTORY
-- ------------------------------------------------------------

explain (
    analyze,
    buffers,
    verbose,
    format text
)

select
    a.id,
    a.job_id,
    a.status,
    a.created_at

from public.applications a

where a.student_id =
      (
          select id
          from public.student_profiles
          limit 1
      )

order by
    a.created_at desc

limit 50;