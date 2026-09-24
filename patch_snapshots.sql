
UPDATE public.submission_candidates sc
SET candidate_snapshot = jsonb_build_object(
    'candidate_name', COALESCE(sc.candidate_snapshot->>'candidate_name', p.first_name || ' ' || p.last_name),
    'enrollment_id', COALESCE(sc.candidate_snapshot->>'enrollment_id', sp.enrollment_id),
    'current_designation', COALESCE(sc.candidate_snapshot->>'current_designation', sp.current_designation),
    'current_company', COALESCE(sc.candidate_snapshot->>'current_company', sp.current_company),
    'total_experience_months', COALESCE((sc.candidate_snapshot->>'total_experience_months')::int, sp.total_experience_months),
    'notice_period_days', COALESCE((sc.candidate_snapshot->>'notice_period_days')::int, sp.notice_period_days),
    'location', COALESCE(sc.candidate_snapshot->>'location', COALESCE(sp.city || CASE WHEN sp.state IS NOT NULL THEN ', ' || sp.state ELSE '' END, sp.country))
)
FROM public.student_profiles sp
JOIN public.profiles p ON p.id = sp.user_id
WHERE sc.student_id = sp.id;
