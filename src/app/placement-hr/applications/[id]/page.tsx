import { getApplicationScore } from "@/services/scoring/get-application-score.service";
import { getVerification } from "@/services/verifications/get-verification.service";
import ScorePanel from "@/components/scoring/score-panel";
import VerificationPanel from "@/components/verifications/verification-panel";
export default async function Page({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;
  const [scoreData, verification] = await Promise.all([
    getApplicationScore(id),
    getVerification(id),
  ]);
  const app = verification.application;
  const student = Array.isArray(app.student_profiles)
    ? app.student_profiles[0]
    : app.student_profiles;
  const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
  return (
    <main className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Application Verification</h1>
        <p className="mt-2 text-slate-500">
          {student?.first_name} {student?.last_name} · {student?.enrollment_id}{" "}
          · {job?.job_title} · {job?.job_code}
        </p>
      </div>
      <ScorePanel applicationId={id} initial={scoreData} />
      <VerificationPanel
        applicationId={id}
        status={app.status}
        automatedMatchScore={app.match_score}
        automatedAtsScore={app.ats_score}
        assignment={verification.assignment}
        currentUserId={verification.currentUserId}
      />
      {verification.verifications.length > 0 && (
        <section className="rounded-xl border p-5">
          <h2 className="text-lg font-semibold">Verification History</h2>
          <div className="mt-4 space-y-3">
            {verification.verifications.map((v) => (
              <div key={v.id} className="rounded-lg border p-3 text-sm">
                <div className="font-medium">{v.verification_status}</div>
                <div>
                  Match {v.final_match_score ?? "—"}% · ATS{" "}
                  {v.final_ats_score ?? "—"}%
                </div>
                {v.rejection_reason && (
                  <p className="text-red-700">{v.rejection_reason}</p>
                )}
                {v.update_request && (
                  <p className="text-amber-700">{v.update_request}</p>
                )}
                {v.notes && <p className="text-slate-600">{v.notes}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
