import JobDetailsView from "@/components/jobs/job-details-view";
import { notFound } from "next/navigation";
import ApplyButton from "@/components/student/apply-button";
import { requireRole } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getApplicationEligibility } from "@/services/applications/application-eligibility.service";

export default async function Page({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  await requireRole("student");
  const { id } = await params;
  const [{ data: job }, eligibility] = await Promise.all([
    supabaseAdmin
      .from("jobs")
      .select(
        "id,job_code,job_title,status,created_at,published_at,role_type,location,country,workplace_type,employment_type,experience_min_years,experience_max_years,salary_min,salary_max,salary_currency,openings,jd_text,application_deadline,companies(name,logo),job_checklists!inner(status,top_3_skills,domain,exp_required,checklist_summary)",
      )
      .eq("id", id)
      .eq("status", "published")
      .eq("job_checklists.status", "approved")
      .single(),
    getApplicationEligibility(id),
  ]);
  
  if (!job) notFound();
  
  const c = Array.isArray(job.job_checklists)
    ? job.job_checklists[0]
    : job.job_checklists;
    
  return (
    <main className="p-8 space-y-6">
      <JobDetailsView job={job} actions={<ApplyButton jobId={id} eligible={eligibility.eligible} reason={eligibility.reason} />} />
      <p className="text-xs text-slate-500 text-right">
        Match% and ATS scoring are calculated after applying.
      </p>
    </main>
  );
}
