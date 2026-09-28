import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { listEligibleApplications } from "@/repositories/submissions.repository";
import { SubmissionForm } from "@/components/submissions/submission-form";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const user = await requireRole(["placement_hr", "admin", "super_admin"]);
  const { jobId } = await searchParams;
  if (!jobId) notFound();
  const { data: job } = await supabaseAdmin
    .from("jobs")
    .select("id,job_code,job_title,assigned_placement_hr")
    .eq("id", jobId)
    .single();
  if (
    !job ||
    (user.roles.includes("placement_hr") &&
      job.assigned_placement_hr &&
      job.assigned_placement_hr !== user.id)
  )
    notFound();
  const candidates = await listEligibleApplications(jobId);
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <p className="text-sm text-gray-500">{job.job_code}</p>
        <h1 className="text-2xl font-bold">
          Submit candidates — {job.job_title}
        </h1>
        <p className="text-gray-600">
          Only HR-verified candidates with effective Match Score ≥ 60% are
          shown.
        </p>
      </div>
      <SubmissionForm jobId={jobId} candidates={candidates} />
    </div>
  );
}
