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
  const { data: checklist } = await supabaseAdmin
    .from("job_checklists")
    .select("id")
    .eq("job_id", jobId)
    .eq("status", "approved")
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (!checklist) {
    throw new AppError("No active checklist found for this job", 422, "APPLICATION_CREATE_FAILED");
  }

  const { data: appInsert, error } = await supabaseAdmin
    .from("applications")
    .insert({
      job_id: jobId,
      student_id: eligibility.studentId,
      cv_id: eligibility.cvId,
      checklist_id: checklist.id,
      status: "scoring_pending",
      score_status: "pending",
    })
    .select("id")
    .single();

  if (error || !appInsert) {
    const msg = error?.message || "Unable to create application";
    throw new AppError(
      msg,
      msg.includes("already applied") || msg.includes("unique") ? 409 : 422,
      "APPLICATION_CREATE_FAILED",
    );
  }

  const appId = appInsert.id;

  await supabaseAdmin.from("audit_logs").insert({
    actor_id: user.id,
    entity_type: "application",
    entity_id: appId,
    action: "APPLICATION_CREATED",
    new_values: { job_id: jobId },
  });
  const { data: application, error: readError } = await supabaseAdmin
    .from("applications")
    .select("*")
    .eq("id", appId)
    .single();
  if (readError) throw new Error(readError.message);
  return application;
}
