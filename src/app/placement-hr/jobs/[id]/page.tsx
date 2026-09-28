import Link from "next/link";
import JobDetailsView from "@/components/jobs/job-details-view";
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
    <main className="p-8 space-y-6">
      <JobDetailsView job={j} actions={
        <>
          <JobSubmitAction jobId={j.id} disabled={j.status !== "draft"} />
          {j.status === "published" && j.candidates_count > 0 && (
            <Link
              href={`/placement-hr/submissions/new?jobId=${j.id}`}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              Submit Candidates
            </Link>
          )}
          <JobActions
            jobId={j.id}
            editHref={`/placement-hr/jobs/${j.id}/edit`}
            returnHref="/placement-hr/jobs"
          />
        </>
      } />
    </main>
  );
}
