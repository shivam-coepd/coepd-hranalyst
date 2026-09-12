import Link from "next/link";
import { getStudentJobFeed } from "@/repositories/student-jobs.repository";
import { requireRole } from "@/lib/auth/guards";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireRole("student");
  const q = await searchParams;
  const r = await getStudentJobFeed({
    search: q.q,
    roleType: q.role,
    workplaceType: q.workplace,
  });
  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-3xl font-bold">Live Jobs</h1>
      <form className="mt-6 grid gap-3 rounded-xl border p-4 md:grid-cols-4">
        <input
          className="rounded border px-3 py-2"
          name="q"
          placeholder="Search title/location/code"
          defaultValue={q.q}
        />
        <select
          className="rounded border px-3 py-2"
          name="role"
          defaultValue={q.role ?? ""}
        >
          <option value="">All roles</option>
          <option>BA</option>
          <option>PO</option>
          <option>PM</option>
          <option>SM</option>
        </select>
        <select
          className="rounded border px-3 py-2"
          name="workplace"
          defaultValue={q.workplace ?? ""}
        >
          <option value="">All workplaces</option>
          <option value="onsite">Onsite</option>
          <option value="hybrid">Hybrid</option>
          <option value="remote">Remote</option>
        </select>
        <button className="rounded bg-slate-950 px-4 py-2 text-white">
          Filter
        </button>
      </form>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {r.jobs.map((j) => (
          <Link
            key={j.id}
            href={`/student/jobs/${j.id}`}
            className="rounded-xl border p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{j.job_title}</h2>
                <p className="text-sm text-slate-500">
                  {j.companies?.name ?? "Company"} · {j.job_code}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
                Match after apply
              </span>
            </div>
            <p className="mt-3 text-sm">
              {j.location ?? "Location TBD"} · {j.workplace_type}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {((j.job_checklists?.[0]?.top_3_skills ?? []) as string[]).map(
                (s: string) => (
                  <span
                    key={s}
                    className="rounded-full border px-2 py-1 text-xs"
                  >
                    {s}
                  </span>
                ),
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
