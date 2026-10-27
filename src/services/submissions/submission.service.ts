import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { createSubmissionSchema } from "@/lib/validators/submission.schema";
import { AppError } from "@/lib/http/route-error";
import { queueNotification } from "@/services/notifications/queue.service";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function createClientSubmission(input: unknown) {
  const user = await requireRole(["super_admin", "admin", "placement_hr"]);
  const parsed = createSubmissionSchema.safeParse(input);
  if (!parsed.success)
    throw new AppError("Invalid submission request", 422, "VALIDATION_ERROR");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_client_submission", {
    p_actor_id: user.id,
    p_job_id: parsed.data.jobId,
    p_application_ids: parsed.data.applicationIds,
    p_notes: parsed.data.notes || undefined,
  });
  if (error) {
    const message = error.message.includes("60%")
      ? error.message
      : error.message.includes("already been submitted")
        ? "One or more candidates have already been submitted"
        : error.message.includes("verified")
          ? "All candidates must be verified before submission"
          : `Unable to create client submission: ${error.message}`;
    throw new AppError(message, 409, "SUBMISSION_FAILED");
  }

  const { data: jobInfo } = await supabaseAdmin
    .from("jobs")
    .select("company_id")
    .eq("id", parsed.data.jobId)
    .single();

  if (jobInfo) {
    const { data: clientHRs } = await supabaseAdmin
      .from("client_hr_profiles")
      .select("user_id")
      .eq("company_id", jobInfo.company_id)
      .eq("is_active", true);

    if (clientHRs) {
      for (const hr of clientHRs) {
        await queueNotification({
          eventType: "CLIENT_SUBMISSION_CREATED",
          channel: "email",
          recipientUserId: hr.user_id,
          entityType: "submission",
          entityId: data as string,
          payload: {
            submission_id: data as string,
            candidate_count: parsed.data.applicationIds.length
          },
        });
      }
    }
  }

  return { submissionId: data as string };

}
