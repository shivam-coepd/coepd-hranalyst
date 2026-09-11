-- Applications without student

select a.id

from public.applications a

left join
public.student_profiles s
on s.id =
   a.student_id

where s.id is null;


-- Applications without job

select a.id

from public.applications a

left join
public.jobs j
on j.id =
   a.job_id

where j.id is null;


-- Submission candidates without application

select sc.id

from public.submission_candidates sc

left join
public.applications a
on a.id =
   sc.application_id

where a.id is null;


-- Interviews without application

select i.id

from public.interviews i

left join
public.applications a
on a.id =
   i.application_id

where a.id is null;


-- Offers without selected feedback

select o.id

from public.offers o

left join
public.interview_feedbacks f
on f.id =
   o.interview_feedback_id

where f.id is null
   or f.decision <>
      'selected';


-- Placements without accepted offer

select p.id

from public.placements p

left join
public.offers o
on o.id =
   p.offer_id

where o.id is null
   or o.status <>
      'accepted';