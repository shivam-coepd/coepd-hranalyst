import "server-only";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  requireRole,
} from "@/lib/auth/guards";

import {
  interviewFeedbackSchema,
  type InterviewFeedbackInput,
} from "@/lib/validators/interview-feedback.schema";

export async function
submitInterviewFeedback(
  input:
    InterviewFeedbackInput
) {

  await requireRole([
    "client_hr",
    "placement_hr",
    "admin",
    "super_admin",
  ]);

  const parsed =
    interviewFeedbackSchema
      .parse(input);

  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "submit_interview_feedback",
      {
        p_interview_id:
          parsed.interviewId,

        p_rating:
          parsed.rating ??
          null,

        p_decision:
          parsed.decision,

        p_reason_code:
          parsed.reasonCode ??
          null,

        p_comments:
          parsed.comments ??
          null,

        p_visible_to_student:
          parsed.visibleToStudent,
      }
    );

  if (error) {
    throw new Error(
      error.message
    );
  }

  return {
    feedbackId:
      data as string,
  };
}