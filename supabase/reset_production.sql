-- ==============================================================================
-- PRODUCTION DATA RESET SCRIPT (Accurate to currentDB.sql)
-- ==============================================================================
-- WARNING: THIS IRREVERSIBLY DELETES ALL TRANSACTIONAL & TEST DATA FOR PRODUCTION LAUNCH.
-- It keeps system roles, system permissions, skill dictionary, and administrative/staff users intact.
-- ==============================================================================

TRUNCATE TABLE 
    -- 1. Operational Logs, Alerts & AI Runs
    public.notification_delivery_logs,
    public.notification_outbox,
    public.notification_jobs,
    public.notifications,
    public.operational_alerts,
    public.audit_logs,
    public.ai_generation_runs,
    public.scoring_runs,
    public.application_processing_jobs,

    -- 2. Placements & Offers
    public.placement_status_history,
    public.placements,
    public.offer_status_history,
    public.offers,

    -- 3. Client Interviews & Feedbacks
    public.interview_feedback_revisions,
    public.interview_feedbacks,
    public.interview_participants,
    public.interview_reschedules,
    public.interview_status_history,
    public.interviews,

    -- 4. Client Decisions & Submissions
    public.client_candidate_decision_history,
    public.client_candidate_decisions,
    public.submission_recipients,
    public.submission_candidate_status_history,
    public.submission_status_history,
    public.submission_candidates,
    public.submissions,

    -- 5. Mock Interviews & Evaluations
    public.mock_scorecard_revisions,
    public.mock_scorecard_template_items,
    public.mock_scorecard_templates,
    public.mock_scorecard_items,
    public.mock_scorecards,
    public.mock_participants,
    public.mock_attendance,
    public.mock_reschedules,
    public.mock_status_history,
    public.mock_interviews,
    public.mock_availability_slots,

    -- 6. Verifications, Scores & Applications
    public.checklist_issues,
    public.application_update_requests,
    public.verification_comments,
    public.verification_assignments,
    public.application_verifications,
    public.application_score_overrides,
    public.application_requirement_matches,
    public.application_scores,
    public.application_cv_history,
    public.application_status_history,
    public.applications,

    -- 7. Student CVs & Candidate Profiles
    public.cv_parsed_profiles,
    public.student_cvs,
    public.student_skills,
    public.student_profiles,

    -- 8. Job Postings & Checklists
    public.job_publications,
    public.job_checklists,
    public.job_status_history,
    public.jobs,

    -- 9. Companies & Client Profiles
    public.client_hr_profiles,
    public.company_status_history,
    public.companies,

    -- 10. User Activity History
    public.user_status_history
CASCADE;

-- ==============================================================================
-- CLEAN NON-STAFF ACCOUNTS (PRESERVING SUPER_ADMIN, ADMIN, AND PLACEMENT_HR)
-- ==============================================================================
DELETE FROM public.user_roles 
WHERE user_id NOT IN (
    SELECT ur.user_id 
    FROM public.user_roles ur 
    JOIN public.roles r ON ur.role_id = r.id 
    WHERE r.name IN ('super_admin', 'admin', 'placement_hr')
);

DELETE FROM public.profiles 
WHERE id NOT IN (
    SELECT user_id FROM public.user_roles
);

-- ==============================================================================
-- PRESERVED SYSTEM TABLES:
-- 1. public.roles                (System Roles)
-- 2. public.permissions          (System Permissions)
-- 3. public.role_permissions     (Permission Matrix)
-- 4. public.skill_aliases        (AI Matching Skill Dictionary)
-- 5. public.profiles             (Super Admin, Admin, and Placement HR staff)
-- 6. public.user_roles           (Staff role assignments)
-- ==============================================================================
