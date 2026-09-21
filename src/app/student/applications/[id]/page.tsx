import { getStudentScore } from "@/services/scoring/get-student-score.service";
import { getEffectiveScore } from "@/lib/applications/effective-score";
export default async function Page({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;
  const { application, score, matches } = await getStudentScore(id);
  const app = application;
  const j = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
  const effectiveMatch = getEffectiveScore(
    app.verified_match_score,
    app.match_score,
  );
  const effectiveAts = getEffectiveScore(app.verified_ats_score, app.ats_score);
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Application</h1>
      <p className="mt-2 text-slate-500">
        {j?.job_title} · {j?.job_code}
      </p>
      <p className="mt-2 text-sm">
        Status: <strong>{app.status}</strong>
      </p>
      {app.rejection_reason && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
          Reason: {app.rejection_reason}
        </div>
      )}
      {app.update_request && (
        <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          Update requested: {app.update_request}
        </div>
      )}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-5">
          <div className="text-sm text-slate-500">Effective Match</div>
          <div className="text-4xl font-bold">
            {effectiveMatch ?? "Pending"}
            {effectiveMatch != null ? "%" : ""}
          </div>
          {app.verified_match_score != null && (
            <div className="mt-1 text-xs text-slate-500">HR verified score</div>
          )}
        </div>
        <div className="rounded-xl border p-5">
          <div className="text-sm text-slate-500">Effective ATS</div>
          <div className="text-4xl font-bold">
            {effectiveAts ?? "Pending"}
            {effectiveAts != null ? "%" : ""}
          </div>
          {app.verified_ats_score != null && (
            <div className="mt-1 text-xs text-slate-500">HR verified score</div>
          )}
        </div>
      </div>
      {score && (
        <div className="mt-6 rounded-xl border p-5">
          <h2 className="font-semibold">Automated Score Breakdown</h2>
          <p className="mt-2 text-sm">
            Must-have {score.must_have_coverage}% · Good-to-have{" "}
            {score.good_to_have_coverage}% · Tools {score.tools_coverage}%
          </p>
          <p className="mt-1 text-sm">
            ATS: Contact {score.ats_contact_score}/20 · Skills{" "}
            {score.ats_skills_score}/30 · Experience{" "}
            {score.ats_experience_score}/20 · Formatting{" "}
            {score.ats_formatting_score}/15 · Length {score.ats_length_score}/15
          </p>
        </div>
      )}
      <div className="mt-6 space-y-3">
        {(
          matches as {
            requirement_name: string;
            matched: boolean;
            evidence: string | null;
          }[]
        ).map((m, i) => (
          <div key={i} className="rounded-lg border p-3">
            <div className="flex justify-between gap-3">
              <span className="font-medium">{m.requirement_name}</span>
              <span>{m.matched ? "Matched" : "Not matched"}</span>
            </div>
            {m.evidence && (
              <p className="mt-1 text-sm text-slate-600">
                Evidence: {m.evidence}
              </p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
