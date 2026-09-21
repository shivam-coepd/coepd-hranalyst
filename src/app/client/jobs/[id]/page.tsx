import JobDetailsView from "@/components/jobs/job-details-view";
import { requireActiveClientHr } from "@/services/client/client-profile.service";
import { getJobById } from "@/repositories/jobs.repository";
import JobSubmitAction from "@/components/jobs/job-submit-action";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { clientProfile } = await requireActiveClientHr();
  const { id } = await params;
  const j = await getJobById(id);
  if (j.company_id !== clientProfile.company_id)
    throw new Error("Job not found");
  return (
    <main className="p-8 space-y-6">
      <JobDetailsView job={j} actions={<JobSubmitAction jobId={j.id} disabled={j.status !== "draft"} />} />
    </main>
  );
}
