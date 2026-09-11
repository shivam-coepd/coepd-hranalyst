-- Duplicate student enrollment IDs

select
    enrollment_id,
    count(*)

from public.student_profiles

where enrollment_id
      is not null

group by
    enrollment_id

having count(*) > 1;


-- Duplicate application per student/job

select
    student_id,
    job_id,
    count(*)

from public.applications

group by
    student_id,
    job_id

having count(*) > 1;


-- Multiple active submission records

select
    application_id,
    count(*)

from public.submission_candidates

where status <>
      'withdrawn'

group by
    application_id

having count(*) > 1;


-- Multiple active offers

select
    application_id,
    count(*)

from public.offers

where status in (
    'uploaded',
    'sent_to_student',
    'accepted'
)

group by
    application_id

having count(*) > 1;  