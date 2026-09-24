
CREATE OR REPLACE FUNCTION public.submit_mock_scorecard(
    p_mock_id uuid,
    p_communication numeric,
    p_technical numeric,
    p_domain numeric,
    p_overall numeric,
    p_scoring_version text,
    p_strengths text[] DEFAULT NULL,
    p_improvement_areas text[] DEFAULT NULL,
    p_evaluator_notes text DEFAULT NULL,
    p_student_visible_notes text DEFAULT NULL,
    p_recommendation text DEFAULT 'neutral'
) RETURNS uuid AS $$
DECLARE
  v_scorecard_id UUID;
  v_actor_id UUID;
  v_app_id UUID;
BEGIN
  -- We don't have evaluator_user_id passed, so we fetch it from mock_interviews
  SELECT application_id, evaluator_user_id INTO v_app_id, v_actor_id
  FROM public.mock_interviews
  WHERE id = p_mock_id;

  v_actor_id := COALESCE(auth.uid(), v_actor_id);

  IF v_app_id IS NULL THEN
    RAISE EXCEPTION 'Mock interview not found';
  END IF;

  -- Insert scorecard
  INSERT INTO public.mock_scorecards (
    mock_interview_id,
    application_id,
    evaluated_by,
    status,
    scoring_version,
    communication_score,
    technical_score,
    domain_score,
    overall_score,
    strengths,
    improvement_areas,
    evaluator_notes,
    student_visible_notes,
    recommendation,
    submitted_at
  )
  VALUES (
    p_mock_id,
    v_app_id,
    v_actor_id,
    'submitted',
    p_scoring_version,
    p_communication,
    p_technical,
    p_domain,
    p_overall,
    p_strengths,
    p_improvement_areas,
    p_evaluator_notes,
    p_student_visible_notes,
    p_recommendation,
    NOW()
  )
  RETURNING id INTO v_scorecard_id;

  -- Complete mock interview
  UPDATE public.mock_interviews
  SET 
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_mock_id;

  -- Update application status
  UPDATE public.applications
  SET status = 'mock_completed', updated_at = NOW()
  WHERE id = v_app_id;
  
  -- Update submission candidates so client can see the mock score!
  UPDATE public.submission_candidates
  SET current_mock_score = p_overall
  WHERE application_id = v_app_id AND status != 'withdrawn';

  RETURN v_scorecard_id;
END;
$$ LANGUAGE plpgsql;

-- Retroactive fix: Update any existing submission_candidates with the latest mock score
UPDATE public.submission_candidates sc
SET current_mock_score = ms.overall_score
FROM (
  SELECT application_id, overall_score
  FROM (
    SELECT application_id, overall_score, 
           ROW_NUMBER() OVER (PARTITION BY application_id ORDER BY submitted_at DESC) as rn
    FROM public.mock_scorecards
    WHERE status = 'submitted'
  ) ranked
  WHERE rn = 1
) ms
WHERE sc.application_id = ms.application_id AND sc.current_mock_score IS DISTINCT FROM ms.overall_score;

