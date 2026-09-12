import Link from "next/link";
import { listScoringApplications } from "@/services/scoring/list-scoring-applications.service";
import { getVerificationQueue } from "@/services/verifications/get-verification.service";
export default async function Page() {
  const [scoring, verification] = await Promise.all([
    listScoringApplications(),
    getVerificationQueue(),
  ]);
  const merged = [
    ...scoring.filter(
      (r) => !["verification_pending", "under_verification"].includes(r.status),
    ),
    ...verification.map((r) => ({
      ...r,
      verified_match_score: r.verified_match_score,
      verified_ats_score: r.verified_ats_score,
    })),
  ];
  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-3xl font-bold">Application Verification Queue</h1>
      <p className="mt-2 text-slate-500">
        Scoring failures, pending scores and HR verification work in one queue.
      </p>
      <div className="mt-6 space-y-3">
        {merged.length === 0 && (
          <div className="rounded-xl border p-5 text-sm text-slate-600">
            No applications awaiting action.
          </div>
        )}
        {merged.map((a) => {
          const j = Array.isArray(a.jobs) ? a.jobs[0] : a.jobs;
          const s = Array.isArray(a.student_profiles)
            ? a.student_profiles[0]
            : a.student_profiles;
          return (
            <Link
              key={a.id}
              href={`/placement-hr/applications/${a.id}`}
              className="block rounded-xl border p-5 hover:bg-slate-50"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <div className="font-semibold">
                    {s?.first_name} {s?.last_name}
                  </div>
                  <div className="text-sm text-slate-500">
                    {s?.enrollment_id} · {j?.job_title} · {j?.job_code}
                  </div>
                </div>
                <div className="text-sm text-right">
                  <div>
                    Match {a.verified_match_score ?? a.match_score ?? "—"}% ·
                    ATS {a.verified_ats_score ?? a.ats_score ?? "—"}%
                  </div>
                  <div className="text-slate-500">{a.status}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
