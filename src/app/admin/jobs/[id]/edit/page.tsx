import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { getJobById } from "@/repositories/jobs.repository";
import { supabaseAdmin } from "@/lib/supabase/admin";
import JobForm from "@/components/jobs/job-form";
import { updateJobAction } from "./actions";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  
  const job = await getJobById(id);
  if (!job) {
    notFound();
  }

  // Need active companies and placement HRs for the dropdowns
  const [{ data: companies }, { data: hrs }] = await Promise.all([
    supabaseAdmin
      .from("companies")
      .select("id, name")
      .eq("verification_status", "verified")
      .eq("is_active", true)
      .order("name"),
    supabaseAdmin
      .from("profiles")
      .select("id, first_name, last_name, email")
      .eq("account_status", "approved")
      .in(
        "id",
        (
          await supabaseAdmin
            .from("user_roles")
            .select("user_id")
            .eq("role_id", (await supabaseAdmin.from("roles").select("id").eq("name", "placement_hr").single()).data?.id || "")
        ).data?.map((r) => r.user_id) || []
      )
  ]);


  const defaults = {
    jobTitle: job.job_title,
    companyId: job.company_id,
    location: job.location || "",
    roleType: job.role_type,
    locationType: job.location_type,
    workplaceType: job.workplace_type,
    employmentType: job.employment_type,
    experienceMinYears: job.experience_min_years?.toString() || "0",
    experienceMaxYears: job.experience_max_years?.toString() || "",
    salaryMin: job.salary_min?.toString() || "",
    salaryMax: job.salary_max?.toString() || "",
    salaryCurrency: job.salary_currency,
    openings: job.openings?.toString() || "1",
    jdText: job.jd_text,
    applicationDeadline: job.application_deadline,
    assignedPlacementHr: job.assigned_placement_hr || "",
  };

  const actionWithId = updateJobAction.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit job</h1>
        <p className="text-slate-500 mt-2">
          Update the details for {job.job_title}.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <JobForm
          action={actionWithId}
          companies={companies || []}
          placementHrs={hrs || []}
          defaults={defaults}
        />
      </div>
    </div>
  );
}
