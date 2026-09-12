import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getStudentApplicationList } from "@/repositories/students.repository";
export default async function Page() {
  await requireRole("student");
  const apps = await getStudentApplicationList();
  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-3xl font-bold">My Applications</h1>
      <div className="mt-6 space-y-3">
        {apps.length === 0 && (
          <div className="rounded-xl border p-5 text-sm text-slate-600">
            No applications yet.
          </div>
        )}
        {apps.map((a) => {
          const j = Array.isArray(a.jobs) ? a.jobs[0] : a.jobs;
          return (
            <div key={a.id} className="rounded-xl border p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <Link
                    className="font-semibold"
                    href={`/student/jobs/${j?.id}`}
                  >
                    {j?.job_title ?? "Job"}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {j?.companies?.name ?? "Company"} · {j?.job_code}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
                  {a.status}
                </span>
              </div>
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                <div>
                  Match:{" "}
                  {a.match_score == null ? "Pending" : `${a.match_score}%`}
                </div>
                <div>
                  ATS: {a.ats_score == null ? "Pending" : `${a.ats_score}%`}
                </div>
                <div>
                  Scoring: {a.score_status} ·{" "}
                  <Link
                    className="underline"
                    href={`/student/applications/${a.id}`}
                  >
                    View details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
