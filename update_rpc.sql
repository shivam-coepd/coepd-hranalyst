
DROP FUNCTION IF EXISTS public.create_client_submission(uuid, uuid, uuid[], text);

CREATE OR REPLACE FUNCTION public.create_client_submission(
    p_actor_id uuid,
    p_job_id uuid,
    p_application_ids uuid[],
    p_notes text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
    v_submission_id uuid;
    v_company_id uuid;
    v_application_id uuid;
    v_student_name text;
    v_enrollment_id text;
    v_current_designation text;
    v_current_company text;
    v_total_experience_months int;
    v_notice_period_days int;
    v_location text;
    v_student_id uuid;
    v_cv_id uuid;
    v_match_score numeric;
    v_ats_score numeric;
    v_candidate_snapshot jsonb;
    v_candidate_count int;
BEGIN
    v_candidate_count := array_length(p_application_ids, 1);

    IF v_candidate_count IS NULL THEN
        RAISE EXCEPTION 'At least one candidate is required';
    END IF;

    SELECT company_id INTO v_company_id
    FROM public.jobs
    WHERE id = p_job_id AND deleted_at IS NULL;

    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'Job not found';
    END IF;

    -- Validate all applications
    FOREACH v_application_id IN ARRAY p_application_ids
    LOOP
        IF NOT EXISTS (
            SELECT 1
            FROM public.applications
            WHERE id = v_application_id
              AND job_id = p_job_id
              AND status = 'verified'
              AND COALESCE(verified_match_score, match_score) >= 60
        ) THEN
            RAISE EXCEPTION 'One or more candidates are not eligible for submission';
        END IF;

        IF EXISTS (
            SELECT 1
            FROM public.submission_candidates
            WHERE application_id = v_application_id
              AND status <> 'withdrawn'
        ) THEN
            RAISE EXCEPTION 'Candidate has already been submitted';
        END IF;
    END LOOP;

    -- Create submission header
    INSERT INTO public.submissions (
        job_id,
        company_id,
        created_by,
        status,
        notes,
        candidate_count,
        submitted_at
    )
    VALUES (
        p_job_id,
        v_company_id,
        p_actor_id,
        'submitted',
        p_notes,
        v_candidate_count,
        now()
    )
    RETURNING id INTO v_submission_id;

    -- Insert candidates
    FOREACH v_application_id IN ARRAY p_application_ids
    LOOP
        -- Fetch snapshot details
        SELECT 
            COALESCE(p.first_name || ' ' || p.last_name, 'Candidate'),
            sp.enrollment_id,
            sp.current_designation,
            sp.current_company,
            sp.total_experience_months,
            sp.notice_period_days,
            COALESCE(sp.city || CASE WHEN sp.state IS NOT NULL THEN ', ' || sp.state ELSE '' END, sp.country),
            a.student_id,
            a.cv_id,
            COALESCE(a.verified_match_score, a.match_score, 0),
            COALESCE(a.verified_ats_score, a.ats_score, 0)
        INTO 
            v_student_name,
            v_enrollment_id,
            v_current_designation,
            v_current_company,
            v_total_experience_months,
            v_notice_period_days,
            v_location,
            v_student_id,
            v_cv_id,
            v_match_score,
            v_ats_score
        FROM public.applications a
        JOIN public.student_profiles sp ON sp.id = a.student_id
        JOIN public.profiles p ON p.id = sp.user_id
        WHERE a.id = v_application_id;

        v_candidate_snapshot := jsonb_build_object(
            'candidate_name', v_student_name,
            'enrollment_id', v_enrollment_id,
            'current_designation', v_current_designation,
            'current_company', v_current_company,
            'total_experience_months', v_total_experience_months,
            'notice_period_days', v_notice_period_days,
            'location', v_location
        );

        INSERT INTO public.submission_candidates (
            submission_id,
            application_id,
            student_id,
            cv_id,
            status,
            candidate_snapshot,
            submitted_match_score,
            submitted_ats_score
        ) VALUES (
            v_submission_id,
            v_application_id,
            v_student_id,
            v_cv_id,
            'submitted',
            v_candidate_snapshot,
            v_match_score,
            v_ats_score
        );
    END LOOP;

    RETURN v_submission_id;
END;
$$ LANGUAGE plpgsql;
