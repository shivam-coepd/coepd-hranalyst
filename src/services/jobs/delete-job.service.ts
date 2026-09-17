import { requireRole } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function deleteJob(jobId: string) {
  const user = await requireRole(["super_admin", "admin", "placement_hr"]);

  const { data: job, error: findError } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .is("deleted_at", null)
    .single();

  if (findError || !job) {
    throw new Error("Job not found");
  }

  // Ensure placement HRs can only delete unassigned jobs or jobs assigned to them
  if (
    user.roles.includes("placement_hr") &&
    !user.roles.some((r) => r === "admin" || r === "super_admin")
  ) {
    if (
      job.assigned_placement_hr &&
      job.assigned_placement_hr !== user.id
    ) {
      throw new Error("You cannot delete a job assigned to another Placement HR");
    }
  }

  const { data, error } = await supabaseAdmin
    .from("jobs")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    })
    .eq("id", jobId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to delete job");
  }

  await supabaseAdmin.from("audit_logs").insert({
    actor_id: user.id,
    entity_type: "job",
    entity_id: jobId,
    action: "JOB_DELETED",
    old_values: job,
    new_values: data,
  });

  return { success: true };
}
