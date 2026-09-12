import "server-only";
import { requireRole } from "@/lib/auth/guards";
import { AppError } from "@/lib/http/route-error";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getApplicationEligibility } from "@/services/applications/application-eligibility.service";
export async function applyToJob(jobId: string) {
  const user = await requireRole("student");
  const eligibility = await getApplicationEligibility(jobId);
  if (!eligibility.eligible || !eligibility.studentId || !eligibility.cvId)
    throw new AppError(
      eligibility.reason ?? "You cannot apply to this job",
      409,
      "APPLICATION_NOT_ELIGIBLE",
    );
  const { data, error } = await supabaseAdmin.rpc(
    "create_student_application",
    {
      p_job_id: jobId,
      p_student_id: eligibility.studentId,
      p_cv_id: eligibility.cvId,
      p_actor_id: user.id,
    },
  );
  if (error) {
    const msg = error.message || "Unable to create application";
    throw new AppError(
      msg,
      msg.includes("already applied") ? 409 : 422,
      "APPLICATION_CREATE_FAILED",
    );
  }
  const { data: application, error: readError } = await supabaseAdmin
    .from("applications")
    .select("*")
    .eq("id", data as string)
    .single();
  if (readError) throw new Error(readError.message);
  return application;
}
