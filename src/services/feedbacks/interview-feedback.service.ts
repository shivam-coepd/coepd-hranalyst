// @ts-nocheck
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { queueNotification } from "@/services/notifications/queue.service";
import { supabaseAdmin } from "@/lib/supabase/admin";
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

  if (data) {
    const { data: interviewInfo } = await supabaseAdmin
      .from("client_interviews")
      .select("submission_candidates(job_applications(student_id))")
      .eq("id", parsed.interviewId)
      .single();

    if (interviewInfo && interviewInfo.submission_candidates && interviewInfo.submission_candidates.job_applications) {
      const studentId = Array.isArray(interviewInfo.submission_candidates.job_applications)
        ? interviewInfo.submission_candidates.job_applications[0].student_id
        : interviewInfo.submission_candidates.job_applications.student_id;

      if (studentId && parsed.visibleToStudent) {
        await queueNotification({
          eventType: "INTERVIEW_FEEDBACK_SUBMITTED",
          channel: "email",
          recipientUserId: studentId,
          entityType: "interview_feedback",
          entityId: data as string,
          payload: { decision: parsed.decision }
        });
      }
    }

    const { data: adminRoles } = await supabaseAdmin.from("roles").select("id").in("name", ["admin", "super_admin"]);
    if (adminRoles && adminRoles.length > 0) {
      const { data: admins } = await supabaseAdmin.from("user_roles").select("user_id").in("role_id", adminRoles.map(r => r.id));
      if (admins) {
        for (const adminUser of admins) {
          await queueNotification({
            eventType: "HRANALYST_UPDATE",
            channel: "email",
            recipientUserId: adminUser.user_id,
            entityType: "interview_feedback",
            entityId: data as string,
            payload: { message: `Interview feedback submitted. Decision: ${parsed.decision}` }
          });
        }
      }
    }
  }

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
