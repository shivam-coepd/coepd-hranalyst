import { requireRole } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { jobSchema, type JobInput } from "@/lib/validators/job.schema";

export async function updateJob(jobId: string, input: JobInput) {
  const user = await requireRole([
    "super_admin",
    "admin",
    "placement_hr",
    "client_hr",
  ]);
  const parsed = jobSchema.safeParse(input);
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid job data");
  const { data: before, error: findError } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .is("deleted_at", null)
    .single();
  if (findError || !before) throw new Error("Job not found");
  if (before.status !== "draft")
    throw new Error("Only draft jobs can be edited");
  if (user.roles.includes("client_hr")) {
    const { data: client } = await supabaseAdmin
      .from("client_hr_profiles")
      .select("company_id,is_active")
      .eq("user_id", user.id)
      .single();
    if (!client?.is_active || client.company_id !== before.company_id)
      throw new Error("You cannot edit this job");
  } else if (
    user.roles.includes("placement_hr") &&
    !user.roles.some((r) => r === "admin" || r === "super_admin")
  ) {
    if (
      before.assigned_placement_hr &&
      before.assigned_placement_hr !== user.id
    )
      throw new Error("You cannot edit a job assigned to another Placement HR");
  }
  const d = parsed.data;
  const companyId = user.roles.includes("client_hr")
    ? before.company_id
    : d.companyId;
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .update({
      company_id: companyId,
      assigned_placement_hr: d.assignedPlacementHr || null,
      job_title: d.jobTitle,
      role_type: d.roleType,
      location_type: d.locationType,
      location: d.location || null,
      country: d.country || null,
      employment_type: d.employmentType,
      workplace_type: d.workplaceType,
      experience_min_years: d.experienceMinYears,
      experience_max_years: d.experienceMaxYears ?? null,
      salary_min: d.salaryMin ?? null,
      salary_max: d.salaryMax ?? null,
      salary_currency: d.salaryCurrency,
      openings: d.openings,
      jd_text: d.jdText,
      application_deadline: d.applicationDeadline
        ? new Date(d.applicationDeadline).toISOString()
        : null,
    })
    .eq("id", jobId)
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? "Unable to update job");
  await supabaseAdmin.from("audit_logs").insert({
    actor_id: user.id,
    entity_type: "job",
    entity_id: jobId,
    action: "JOB_UPDATED",
    old_values: before,
    new_values: data,
  });
  return data;
}

export async function assignPlacementHr(
  jobId: string,
  placementHrId: string | null,
) {
  const user = await requireRole(["super_admin", "admin", "placement_hr"]);
  if (placementHrId) {
    const { data: role } = await supabaseAdmin
      .from("roles")
      .select("id")
      .eq("name", "placement_hr")
      .single();
    const { data: assignment } = role
      ? await supabaseAdmin
          .from("user_roles")
          .select("id")
          .eq("user_id", placementHrId)
          .eq("role_id", role.id)
          .maybeSingle()
      : { data: null };
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("account_status")
      .eq("id", placementHrId)
      .single();
    if (!assignment || profile?.account_status !== "approved")
      throw new Error("Approved Placement HR required");
  }
  const { error } = await supabaseAdmin
    .from("jobs")
    .update({ assigned_placement_hr: placementHrId })
    .eq("id", jobId);
  if (error) throw new Error(error.message);
  await supabaseAdmin.from("audit_logs").insert({
    actor_id: user.id,
    entity_type: "job",
    entity_id: jobId,
    action: "JOB_HR_ASSIGNED",
    new_values: { assigned_placement_hr: placementHrId },
  });
  return { success: true };
}
