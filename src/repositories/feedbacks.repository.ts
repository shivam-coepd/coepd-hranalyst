import "server-only";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

export async function
getFeedbackByInterviewId(
  interviewId:
    string
) {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        "interview_feedbacks"
      )
      .select(`
        id,
        feedback_code,
        interview_id,
        application_id,
        submission_candidate_id,
        company_id,
        rating,
        decision,
        reason_code,
        comments,
        client_visible_to_student,
        feedback_due_at,
        feedback_status,
        submitted_by,
        submitted_at
      `)
      .eq(
        "interview_id",
        interviewId
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      error.message
    );
  }

  return data;
}