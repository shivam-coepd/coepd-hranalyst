-- ==============================================================================
-- PRODUCTION DATA RESET SCRIPT
-- ==============================================================================
-- WARNING: THIS WILL IRREVERSIBLY DELETE ALL TRANSACTIONAL DATA.
-- It will keep core users, roles, profiles, and companies intact.
-- ==============================================================================

TRUNCATE TABLE 
    -- 1. Jobs & Checklists
    public.jobs,
    
    -- 2. Applications & CVs
    public.applications,
    public.student_cvs,
    
    -- 3. Mock Interviews
    public.mock_interviews,
    public.mock_availability_slots,
    
    -- 4. Verifications & Submissions
    public.application_verifications,
    public.submissions,
    
    -- 5. Client Interviews
    public.interviews,
    
    -- 6. Offers & Placements
    public.offers,
    public.placements,
    
    -- 7. System & Logs
    public.notifications,
    public.notification_outbox,
    public.notification_jobs,
    public.notification_delivery_logs,
    public.operational_alerts,
    public.audit_logs,
    public.ai_generation_runs,
    public.scoring_runs,
    public.application_processing_jobs
CASCADE;

-- Note on CASCADE:
-- Using CASCADE automatically deletes all dependent records in child tables, such as:
-- - job_checklists, job_status_history, job_publications
-- - application_status_history, application_requirement_matches, application_scores
-- - interview_feedbacks, interview_participants, interview_status_history
-- - mock_scorecards, mock_participants
-- - submission_candidates
-- - student_skills

