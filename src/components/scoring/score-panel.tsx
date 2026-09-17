"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
type ScorePanelData = {
  application: {
    status: string;
    score_status: string;
    scoring_error?: string | null;
  };
  score: {
    match_score: number;
    ats_score: number;
    must_have_coverage: number;
    good_to_have_coverage: number;
    tools_coverage: number;
    ats_contact_score: number;
    ats_skills_score: number;
    ats_experience_score: number;
    ats_formatting_score: number;
    ats_length_score: number;
  } | null;
  matches: unknown[];
};
export default function ScorePanel({
  applicationId,
  initial,
}: {
  applicationId: string;
  initial: ScorePanelData;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const app = initial.application;
  const score = initial.score;
  async function run() {
    setBusy(true);
    try {
      const r = await fetch(`/api/applications/${applicationId}/score`, {
        method: "POST",
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Scoring failed");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Scoring failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-xl border p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold">Status: {app.status}</div>
            <div className="text-sm text-slate-500">
              Scoring: {app.score_status}
            </div>
          </div>
          <button
            disabled={busy || app.score_status === "processing"}
            onClick={run}
            className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {busy ? "Scoring…" : score ? "Re-run scoring" : "Run scoring"}
          </button>
        </div>
        {app.scoring_error && (
          <p className="mt-3 text-sm text-red-600">{app.scoring_error}</p>
        )}
      </div>
      {score && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-5">
              <div className="text-sm text-slate-500">Match Score</div>
              <div className="text-4xl font-bold">{score.match_score}%</div>
              <div className="mt-3 text-sm">
                Must-have {score.must_have_coverage}% · Good-to-have{" "}
                {score.good_to_have_coverage}% · Tools {score.tools_coverage}%
              </div>
            </div>
            <div className="rounded-xl border p-5">
              <div className="text-sm text-slate-500">ATS Score</div>
              <div className="text-4xl font-bold">{score.ats_score}%</div>
              <div className="mt-3 text-sm">
                Contact {score.ats_contact_score}/20 · Skills{" "}
                {score.ats_skills_score}/30 · Experience{" "}
                {score.ats_experience_score}/20 · Formatting{" "}
                {score.ats_formatting_score}/15 · Length{" "}
                {score.ats_length_score}/15
              </div>
            </div>
          </div>
          <div className="rounded-xl border p-5">
            <h2 className="text-lg font-semibold">Requirement Evidence</h2>
            <div className="mt-4 space-y-3">
              {(
                initial.matches as {
                  id?: string | number;
                  requirement_name: string;
                  matched: boolean;
                  requirement_type: string;
                  match_method: string;
                  confidence: number;
                  evidence: string | null;
                }[]
              ).map((m) => (
                <div
                  key={`${m.requirement_type}-${m.requirement_name}`}
                  className="rounded-lg border p-3"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{m.requirement_name}</span>
                    <span>{m.matched ? "Matched" : "Not matched"}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {m.requirement_type} · {m.match_method} · confidence{" "}
                    {Number(m.confidence).toFixed(2)}
                  </div>
                  {m.evidence && <p className="mt-1 text-sm">{m.evidence}</p>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
