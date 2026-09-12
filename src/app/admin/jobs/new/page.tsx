import { requireAdmin } from "@/lib/auth/guards";
import JobForm from "@/components/jobs/job-form";
import { getVerifiedActiveCompanies } from "@/repositories/companies.repository";
import { getPlacementHrOptions } from "@/repositories/jobs.repository";
import { createJobAction } from "./actions";
export default async function Page() {
  await requireAdmin();
  const [c, h] = await Promise.all([
    getVerifiedActiveCompanies(),
    getPlacementHrOptions(),
  ]);
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-bold">Create job</h1>
      {c.length ? (
        <JobForm action={createJobAction} companies={c} placementHrs={h} />
      ) : (
        <p className="mt-6">
          Verify at least one company before creating a job.
        </p>
      )}
    </main>
  );
}
