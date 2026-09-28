import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getClientCandidate(submissionCandidateId: string) {
  const { data, error } = await supabaseAdmin
    .from("submission_candidates")
    .select(
      `
        id,
        application_id,
        student_id,
        status,
        candidate_snapshot,
        submitted_match_score,
        submitted_ats_score,
        current_mock_score,
        created_at,

        submissions!inner (
          id,
          submission_code,
          company_id,
          job_id,
          status,
          submitted_at,

          companies (
            id,
            name,
            logo
          ),

          jobs (
            id,
            job_code,
            job_title,
            role_type,
            location,
            workplace_type
          )
        ),

        client_candidate_decisions (
          id,
          decision,
          reason_code,
          reason,
          is_current,
          decided_at
        ),

        applications (
          id,
          status,
          student_profiles (
            id,
            enrollment_id,
            first_name,
            last_name,
            phone,
            city,
            state,
            country,
            total_experience_months,
            current_company,
            current_designation,
            current_ctc,
            expected_ctc,
            notice_period_days,
            linkedin_url,
            github_url,
            portfolio_url,
            headline,
            summary,
            highest_qualification,
            graduation_year,
            specialization,
            preferred_role,
            willing_to_relocate,
            current_employment_status
          )
        )
      `,
    )
    .eq("id", submissionCandidateId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
