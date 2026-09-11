import "server-only";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

export async function
getInterviewById(
  interviewId: string
) {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from("interviews")
      .select(`
        id,
        interview_code,
        application_id,
        submission_candidate_id,
        job_id,
        company_id,
        client_hr_user_id,
        round_number,
        round_name,
        interview_type,
        scheduled_at,
        duration_minutes,
        timezone,
        mode,
        meeting_provider,
        meeting_link,
        location,
        instructions,
        status,
        created_at,
        updated_at,

        jobs (
          id,
          job_code,
          job_title,
          role_type
        ),

        companies (
          id,
          name,
          logo
        ),

        submission_candidates (
          id,
          candidate_snapshot,
          submitted_match_score,
          submitted_ats_score,
          current_mock_score
        ),

        interview_status_history (
          id,
          old_status,
          new_status,
          reason,
          changed_at
        ),

        interview_reschedules (
          id,
          old_scheduled_at,
          new_scheduled_at,
          reason,
          rescheduled_at
        )
      `)
      .eq(
        "id",
        interviewId
      )
      .single();

  if (error) {
    throw new Error(
      error.message
    );
  }

  return data;
}

export async function
getClientInterviews(
  companyId: string
) {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from("interviews")
      .select(`
        id,
        interview_code,
        round_number,
        round_name,
        interview_type,
        scheduled_at,
        duration_minutes,
        timezone,
        mode,
        meeting_link,
        location,
        status,

        jobs (
          id,
          job_title
        ),

        submission_candidates (
          id,
          candidate_snapshot,
          current_mock_score
        )
      `)
      .eq(
        "company_id",
        companyId
      )
      .is(
        "deleted_at",
        null
      )
      .order(
        "scheduled_at",
        {
          ascending:
            true,
        }
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return data ?? [];
}

export async function
getStudentInterviews(
  studentId: string
) {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from("interviews")
      .select(`
        id,
        interview_code,
        application_id,
        round_number,
        round_name,
        interview_type,
        scheduled_at,
        duration_minutes,
        timezone,
        mode,
        meeting_link,
        location,
        instructions,
        status,

        jobs (
          id,
          job_title
        ),

        companies (
          id,
          name,
          logo
        ),

        applications!inner (
          id,
          student_id
        )
      `)
      .eq(
        "applications.student_id",
        studentId
      )
      .is(
        "deleted_at",
        null
      )
      .order(
        "scheduled_at",
        {
          ascending:
            true,
        }
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return data ?? [];
}