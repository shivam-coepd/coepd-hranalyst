import Link from "next/link";
import { requireActiveClientHr } from "@/services/client/client-profile.service";
import { getJobs } from "@/repositories/jobs.repository";
export default async function Page() {
  const { clientProfile } = await requireActiveClientHr();
  const r = await getJobs({ companyId: clientProfile.company_id });
  return (
    <main className="p-8">
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-slate-600">Your company requisitions.</p>
        </div>
        <Link
          className="rounded bg-slate-950 px-4 py-2 text-white"
          href="/client/jobs/new"
        >
          Create job
        </Link>
      </div>
      <div className="mt-6 space-y-3">
        {r.jobs.map((j) => (
          <Link
            href={`/client/jobs/${j.id}`}
            key={j.id}
            className="block rounded border p-4"
          >
            <div className="font-semibold">{j.job_title}</div>
            <div className="text-sm text-slate-600">
              {j.job_code} · {j.status} · {j.location ?? "Location TBD"}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
