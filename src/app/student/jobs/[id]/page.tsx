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
        "id,job_code,job_title,role_type,location,country,workplace_type,employment_type,experience_min_months,experience_max_months,salary_min,salary_max,salary_currency,openings,jd_text,application_deadline,companies(name,logo),job_checklists!inner(status,top_3_skills,domain,exp_required,checklist_summary)",
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
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-bold">{job.job_title}</h1>
      <p className="mt-1 text-slate-600">
        {job.companies?.name ?? "Company"} · {job.job_code}
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-xs text-slate-500">Location</div>
          <div>
            {job.location ?? "TBD"} · {job.workplace_type}
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs text-slate-500">Experience</div>
          <div>
            {c?.exp_required ||
              `${job.experience_min_months}-${job.experience_max_months ?? "+"} months`}
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-xs text-slate-500">Domain</div>
          <div>{c?.domain || "Not specified"}</div>
        </div>
      </div>
      <section className="mt-8 rounded-xl border p-5">
        <h2 className="font-semibold">Top skills</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {((c?.top_3_skills ?? []) as string[]).map((s) => (
            <span
              key={s}
              className="rounded-full bg-slate-100 px-3 py-1 text-sm"
            >
              {s}
            </span>
          ))}
        </div>
      </section>
      <section className="mt-8 rounded-xl border p-5">
        <h2 className="font-semibold">Job description</h2>
        <div className="mt-3 whitespace-pre-wrap text-sm leading-6">
          {job.jd_text}
        </div>
      </section>
      <div className="mt-8">
        <ApplyButton
          jobId={id}
          eligible={eligibility.eligible}
          reason={eligibility.reason}
        />
        <p className="mt-3 text-xs text-slate-500">
          Match% and ATS scoring are calculated in Stage 6 after your
          application is created.
        </p>
      </div>
    </main>
  );
}
