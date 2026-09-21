CREATE OR REPLACE FUNCTION public.finalize_application_verification(
    p_application_id uuid,
    p_decision text,
    p_verified_match_score numeric DEFAULT NULL,
    p_verified_ats_score numeric DEFAULT NULL,
    p_must_have_verified boolean DEFAULT NULL,
    p_cv_verified boolean DEFAULT NULL,
    p_experience_verified boolean DEFAULT NULL,
    p_domain_verified boolean DEFAULT NULL,
    p_notes text DEFAULT NULL,
    p_reason text DEFAULT NULL,
    p_update_request text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
    v_actor uuid;
    v_application public.applications%rowtype;
    v_new_status text;
    v_verification_id uuid;
BEGIN
    v_actor := auth.uid();
    
    IF v_actor IS NULL THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- Validate decision
    IF p_decision NOT IN ('verified', 'rejected', 'update_requested') THEN
        RAISE EXCEPTION 'Invalid decision';
    END IF;

    -- Fetch application
    SELECT * INTO v_application
    FROM public.applications
    WHERE id = p_application_id
    FOR UPDATE;

    IF v_application.id IS NULL THEN
        RAISE EXCEPTION 'Application not found';
    END IF;

    -- Map decision to application status
    IF p_decision = 'verified' THEN
        v_new_status := 'verified';
    ELSIF p_decision = 'rejected' THEN
        v_new_status := 'rejected';
    ELSIF p_decision = 'update_requested' THEN
        v_new_status := 'under_verification';
    END IF;

    -- Try to find an existing verification record
    SELECT id INTO v_verification_id FROM public.application_verifications WHERE application_id = p_application_id LIMIT 1;

    IF v_verification_id IS NOT NULL THEN
        UPDATE public.application_verifications SET
            verification_status = p_decision,
            final_match_score = p_verified_match_score,
            final_ats_score = p_verified_ats_score,
            must_have_verified = COALESCE(p_must_have_verified, false),
            cv_verified = COALESCE(p_cv_verified, false),
            experience_verified = COALESCE(p_experience_verified, false),
            domain_verified = COALESCE(p_domain_verified, false),
            notes = p_notes,
            rejection_reason = p_reason,
            update_request = p_update_request,
            verified_by = v_actor,
            verified_at = now()
        WHERE id = v_verification_id;
    ELSE
        INSERT INTO public.application_verifications (
            application_id,
            verification_status,
            final_match_score,
            final_ats_score,
            must_have_verified,
            cv_verified,
            experience_verified,
            domain_verified,
            notes,
            rejection_reason,
            update_request,
            verified_by,
            verified_at
        ) VALUES (
            p_application_id,
            p_decision,
            p_verified_match_score,
            p_verified_ats_score,
            COALESCE(p_must_have_verified, false),
            COALESCE(p_cv_verified, false),
            COALESCE(p_experience_verified, false),
            COALESCE(p_domain_verified, false),
            p_notes,
            p_reason,
            p_update_request,
            v_actor,
            now()
        ) RETURNING id INTO v_verification_id;
    END IF;

    -- Update applications table
    UPDATE public.applications
    SET 
        status = v_new_status,
        verified_match_score = p_verified_match_score,
        verified_ats_score = p_verified_ats_score,
        verification_notes = p_notes,
        rejection_reason = p_reason,
        update_request = p_update_request,
        verified_by = v_actor,
        verified_at = CASE WHEN p_decision = 'verified' THEN now() ELSE NULL END,
        updated_at = now()
    WHERE id = p_application_id;

    -- Insert into history
    INSERT INTO public.application_status_history (
        application_id,
        old_status,
        new_status,
        changed_by,
        reason,
        metadata
    ) VALUES (
        p_application_id,
        v_application.status,
        v_new_status,
        v_actor,
        COALESCE(p_reason, p_update_request, p_notes),
        '{}'::jsonb
    );

    RETURN v_verification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
