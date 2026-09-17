import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";
import { createSubmissionSchema } from "@/lib/validators/submission.schema";
import { AppError } from "@/lib/http/route-error";

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
          : "Unable to create client submission";
    throw new AppError(message, 409, "SUBMISSION_FAILED");
  }
  return { submissionId: data as string };
}
