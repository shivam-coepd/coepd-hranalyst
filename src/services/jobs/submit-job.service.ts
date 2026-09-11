import { requireRole } from "@/lib/auth/guards";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function submitJobForChecklist(jobId: string) {
  const user = await requireRole([
    "super_admin",
    "admin",
    "placement_hr",
    "client_hr",
  ]);

  const { data: job, error: findError } = await supabaseAdmin
    .from("jobs")
    .select(
      `
        id,
        status,
        company_id,
        created_by,
        jd_text
      `,
    )
    .eq("id", jobId)
    .is("deleted_at", null)
    .single();

  if (findError || !job) {
    throw new Error("Job not found");
  }

  if (job.status !== "draft") {
    throw new Error("Only draft jobs can be submitted");
  }

  if (!job.jd_text || job.jd_text.trim().length < 50) {
    throw new Error("A complete job description is required");
  }

  /*
   * Client HR ownership check.
   */
  if (user.roles.includes("client_hr")) {
    const { data: client } = await supabaseAdmin
      .from("client_hr_profiles")
      .select("company_id")
      .eq("user_id", user.id)
      .single();

    if (!client || client.company_id !== job.company_id) {
      throw new Error("You cannot submit this job");
    }
  }

  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("jobs")
    .update({ status: "pending_checklist" })
    .eq("id", jobId)
    .eq("status", "draft");
  if (error) throw new Error(error.message);

  await Promise.all([
    supabaseAdmin.from("job_status_history").insert({
      job_id: jobId,

      old_status: "draft",

      new_status: "pending_checklist",

      changed_by: user.id,
    }),

    supabaseAdmin.from("audit_logs").insert({
      actor_user_id: user.id,

      entity_type: "job",

      entity_id: jobId,

      action: "JOB_SUBMITTED_FOR_CHECKLIST",

      old_data: {
        status: "draft",
      },

      new_data: {
        status: "pending_checklist",
        submitted_for_checklist_at: now,
      },
    }),
  ]);

  return {
    success: true,
  };
}
