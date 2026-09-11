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
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-bold">{j.job_title}</h1>
      <p className="mt-1 text-slate-600">
        {j.job_code} · {j.status}
      </p>
      <div className="mt-6">
        <JobSubmitAction jobId={j.id} disabled={j.status !== "draft"} />
      </div>
      <pre className="mt-8 whitespace-pre-wrap rounded border bg-slate-50 p-5 font-sans">
        {j.jd_text}
      </pre>
    </main>
  );
}
