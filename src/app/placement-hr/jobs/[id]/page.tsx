import { requireRole } from "@/lib/auth/guards";
import { getJobById } from "@/repositories/jobs.repository";
import JobSubmitAction from "@/components/jobs/job-submit-action";
import JobActions from "@/components/jobs/job-actions";

export default async function Page({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const u = await requireRole(["placement_hr", "admin", "super_admin"]);
  const { id } = await params;
  const j = await getJobById(id);
  if (
    u.roles.includes("placement_hr") &&
    j.assigned_placement_hr &&
    j.assigned_placement_hr !== u.id
  )
    throw new Error("Job not assigned to you");
  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{j.job_title}</h1>
          <p className="mt-1 text-slate-600">
            {j.job_code} · {j.status} · {j.companies?.name}
          </p>
        </div>
        <JobActions
          jobId={j.id}
          editHref={`/placement-hr/jobs/${j.id}/edit`}
          returnHref="/placement-hr/jobs"
        />
      </div>
      <div className="mt-6">
        <JobSubmitAction jobId={j.id} disabled={j.status !== "draft"} />
      </div>
      <pre className="mt-8 whitespace-pre-wrap rounded border p-5 font-sans">
        {j.jd_text}
      </pre>
    </main>
  );
}
