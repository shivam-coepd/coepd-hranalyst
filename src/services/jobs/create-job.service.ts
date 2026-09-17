import { requireRole } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { jobSchema, type JobInput } from "@/lib/validators/job.schema";

async function resolveCompanyId(
  user: Awaited<ReturnType<typeof requireRole>>,
  requestedCompanyId: string,
) {
  if (!user.roles.includes("client_hr")) return requestedCompanyId;
  const { data, error } = await supabaseAdmin
    .from("client_hr_profiles")
    .select(
      "company_id,is_active,companies(verification_status,is_active,deleted_at)",
    )
    .eq("user_id", user.id)
    .single();
  if (error || !data || !data.is_active)
    throw new Error("Active Client HR profile not found");
  const company = Array.isArray(data.companies)
    ? data.companies[0]
    : data.companies;
  if (
    !company ||
    company.verification_status !== "verified" ||
    !company.is_active ||
    company.deleted_at
  )
    throw new Error("A verified active company is required");
  return data.company_id;
}

export async function createJob(input: JobInput) {
  const user = await requireRole([
    "super_admin",
    "admin",
    "placement_hr",
    "client_hr",
  ]);
  const parsed = jobSchema.safeParse(input);
  if (!parsed.success)
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid job data");
  const data = parsed.data;
  const companyId = await resolveCompanyId(user, data.companyId);
  const { data: company } = await supabaseAdmin
    .from("companies")
    .select("id,verification_status,is_active,deleted_at")
    .eq("id", companyId)
    .single();
  if (
    !company ||
    company.verification_status !== "verified" ||
    company.deleted_at
  )
    throw new Error("Jobs may only be created for verified active companies");

  if (company.is_active === false) {
    throw new Error("Company account is inactive");
  }

  const { data: job, error } = await supabaseAdmin
    .from("jobs")
    .insert({
      company_id: companyId,
      created_by: user.id,
      assigned_placement_hr: data.assignedPlacementHr || null,
      job_title: data.jobTitle,
      role_type: data.roleType,
      location_type: data.locationType,
      location: data.location || null,
      country: data.country || null,
      employment_type: data.employmentType,
      workplace_type: data.workplaceType,
      experience_min_months: data.experienceMinMonths,
      experience_max_months: data.experienceMaxMonths ?? null,
      salary_min: data.salaryMin ?? null,
      salary_max: data.salaryMax ?? null,
      salary_currency: data.salaryCurrency,
      openings: data.openings,
      jd_text: data.jdText,
      application_deadline: data.applicationDeadline
        ? new Date(data.applicationDeadline).toISOString()
        : null,
      status: "draft",
    })
    .select()
    .single();
  if (error || !job) throw new Error(error?.message ?? "Unable to create job");

  const [historyResult, auditResult] = await Promise.all([
    supabaseAdmin.from("job_status_history").insert({
      job_id: job.id,
      old_status: null,
      new_status: "draft",
      changed_by: user.id,
    }),

    supabaseAdmin.from("audit_logs").insert({
      actor_id: user.id,
      entity_type: "job",
      entity_id: job.id,
      action: "JOB_CREATED",
      new_values: {
        job_code: job.job_code,
        title: job.job_title,
        status: job.status,
      },
    }),
  ]);

  if (historyResult.error) {
    throw new Error(
      `Failed to create job status history: ${historyResult.error.message}`,
    );
  }

  if (auditResult.error) {
    throw new Error(`Failed to create audit log: ${auditResult.error.message}`);
  }

  return job;
}
