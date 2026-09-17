import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import {
  interviewFeedbackSchema,
  reviseInterviewFeedbackSchema,
  type InterviewFeedbackInput,
  type ReviseInterviewFeedbackInput,
} from "@/lib/validators/interview-feedback.schema";
export async function submitInterviewFeedback(input: InterviewFeedbackInput) {
  await requireRole(["client_hr", "placement_hr", "admin", "super_admin"]);
  const parsed = interviewFeedbackSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_interview_feedback", {
    p_interview_id: parsed.interviewId,
    p_rating: parsed.rating ?? 0,
    p_decision: parsed.decision,
    p_reason_code: parsed.reasonCode ?? undefined,
    p_comments: parsed.comments ?? undefined,
    p_visible_to_student: parsed.visibleToStudent,
  });
  if (error) throw new Error(error.message);
  return { feedbackId: data as string };
}
export async function reviseInterviewFeedback(
  input: ReviseInterviewFeedbackInput,
) {
  await requireRole(["client_hr", "placement_hr", "admin", "super_admin"]);
  const parsed = reviseInterviewFeedbackSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("revise_interview_feedback", {
    p_feedback_id: parsed.feedbackId,
    p_rating: parsed.rating ?? 0,
    p_decision: parsed.decision,
    p_reason_code: parsed.reasonCode ?? undefined,
    p_comments: parsed.comments ?? undefined,
    p_visible_to_student: parsed.visibleToStudent,
    p_revision_reason: parsed.revisionReason,
  });
  if (error) throw new Error(error.message);
  return { feedbackId: data as string };
}
