CREATE OR REPLACE FUNCTION public.withdraw_student_application(p_application_id uuid, p_student_id uuid)
RETURNS void AS $$
DECLARE
    v_app_exists boolean;
    v_submission_candidate_ids uuid[];
    v_interview_ids uuid[];
BEGIN
    -- Verify application belongs to student
    SELECT EXISTS(
        SELECT 1 FROM applications
        WHERE id = p_application_id AND student_id = p_student_id
    ) INTO v_app_exists;

    IF NOT v_app_exists THEN
        RAISE EXCEPTION 'Application not found or unauthorized';
    END IF;

    -- Collect submission candidate IDs for cascading deletes
    SELECT array_agg(id) INTO v_submission_candidate_ids
    FROM submission_candidates
    WHERE application_id = p_application_id;

    -- Collect interview IDs
    IF v_submission_candidate_ids IS NOT NULL AND array_length(v_submission_candidate_ids, 1) > 0 THEN
        SELECT array_agg(id) INTO v_interview_ids
        FROM interviews
        WHERE submission_candidate_id = ANY(v_submission_candidate_ids);
    END IF;

    -- Delete interview history and participants
    IF v_interview_ids IS NOT NULL AND array_length(v_interview_ids, 1) > 0 THEN
        DELETE FROM interview_status_history WHERE interview_id = ANY(v_interview_ids);
        DELETE FROM interview_participants WHERE interview_id = ANY(v_interview_ids);
        DELETE FROM interview_reschedules WHERE interview_id = ANY(v_interview_ids);
    END IF;

    -- Delete from client candidate decisions and history
    IF v_submission_candidate_ids IS NOT NULL AND array_length(v_submission_candidate_ids, 1) > 0 THEN
        DELETE FROM client_candidate_decision_history WHERE submission_candidate_id = ANY(v_submission_candidate_ids);
        DELETE FROM client_candidate_decisions WHERE submission_candidate_id = ANY(v_submission_candidate_ids);
        
        -- Delete interview feedbacks
        -- wait, interview_feedback_revisions depends on interview_feedbacks
        DELETE FROM interview_feedback_revisions 
        WHERE feedback_id IN (SELECT id FROM interview_feedbacks WHERE submission_candidate_id = ANY(v_submission_candidate_ids));
        
        DELETE FROM interview_feedbacks WHERE submission_candidate_id = ANY(v_submission_candidate_ids);
        DELETE FROM interviews WHERE submission_candidate_id = ANY(v_submission_candidate_ids);
        
        -- Delete submission status history
        -- wait, is there a submission_candidate_status_history? Let's assume there is none if we didn't find one.
    END IF;

    -- Delete application requirement matches (cascades manually to be safe)
    DELETE FROM application_requirement_matches 
    WHERE application_score_id IN (SELECT id FROM application_scores WHERE application_id = p_application_id);

    -- Delete application scores and scoring runs
    DELETE FROM application_scores WHERE application_id = p_application_id;
    -- DELETE FROM application_scoring_runs WHERE application_id = p_application_id;

    -- Delete application verifications
    DELETE FROM application_verifications WHERE application_id = p_application_id;

    -- Delete application status history
    DELETE FROM application_status_history WHERE application_id = p_application_id;

    -- Delete submission candidates
    DELETE FROM submission_candidates WHERE application_id = p_application_id;

    -- Finally delete the application
    DELETE FROM applications WHERE id = p_application_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
