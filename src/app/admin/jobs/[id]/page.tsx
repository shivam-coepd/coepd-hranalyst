import JobDetailsView from "@/components/jobs/job-details-view";
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
    <main className="p-8 space-y-6">
      <JobDetailsView job={job} actions={
        <>
          <JobSubmitAction jobId={job.id} disabled={job.status !== "draft"} />
          <JobActions
            jobId={job.id}
            editHref={`/admin/jobs/${job.id}/edit`}
            returnHref="/admin/jobs"
          />
        </>
      } />
      <ChecklistWorkflow
        jobId={job.id}
        jobStatus={job.status}
        initialChecklist={checklist as never}
      />
    </main>
  );
}
