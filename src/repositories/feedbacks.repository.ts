import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getFeedbackByInterviewId(interviewId: string) {
  const { data, error } = await supabaseAdmin
    .from("interview_feedbacks")
    .select(
      `id,feedback_code,interview_id,application_id,submission_candidate_id,company_id,rating,decision,reason_code,comments,client_visible_to_student,feedback_due_at,feedback_status,submitted_by,submitted_at,revised_at,revised_by`,
    )
    .eq("interview_id", interviewId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getFeedbackRevisions(feedbackId: string) {
  const { data, error } = await supabaseAdmin
    .from("interview_feedback_revisions")
    .select(
      "id,revision_number,previous_rating,previous_decision,new_rating,new_decision,reason,revised_by,revised_at",
    )
    .eq("feedback_id", feedbackId)
    .order("revision_number", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
