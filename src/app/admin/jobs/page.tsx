import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { getJobs } from "@/repositories/jobs.repository";
export default async function Page() {
  await requireAdmin();
  const r = await getJobs();
  return (
    <main className="p-8">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">All jobs</h1>
        <Link
          className="rounded bg-slate-950 px-4 py-2 text-white"
          href="/admin/jobs/new"
        >
          Create job
        </Link>
      </div>
      <div className="mt-6 space-y-3">
        {r.jobs.map((j) => (
          <Link
            key={j.id}
            href={`/admin/jobs/${j.id}`}
            className="block rounded border p-4"
          >
            <b>{j.job_title}</b>
            <div className="text-sm text-slate-600">
              {j.job_code} · {j.status}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
