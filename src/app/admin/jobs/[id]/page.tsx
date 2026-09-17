import { requireAdmin } from "@/lib/auth/guards";
import { getJobById } from "@/repositories/jobs.repository";
import { getChecklistForJob } from "@/repositories/checklists.repository";
import JobSubmitAction from "@/components/jobs/job-submit-action";
import ChecklistWorkflow from "@/components/checklists/checklist-workflow";
import JobActions from "@/components/jobs/job-actions";
export default async function Page({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [job, checklist] = await Promise.all([
    getJobById(id),
    getChecklistForJob(id),
  ]);
  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{job.job_title}</h1>
          <p className="mt-1 text-slate-600">
            {job.job_code} · {job.status}
          </p>
        </div>
        <JobActions
          jobId={job.id}
          editHref={`/admin/jobs/${job.id}/edit`}
          returnHref="/admin/jobs"
        />
      </div>
      <div className="mt-6">
        <JobSubmitAction jobId={job.id} disabled={job.status !== "draft"} />
      </div>
      <section className="mt-8 rounded-xl border bg-slate-50 p-5">
        <h2 className="font-semibold">Job description</h2>
        <div className="mt-3 whitespace-pre-wrap text-sm leading-6">
          {job.jd_text}
        </div>
      </section>
      <ChecklistWorkflow
        jobId={job.id}
        jobStatus={job.status}
        initialChecklist={checklist as never}
      />
    </main>
  );
}
