"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
type Candidate = {
  id: string;
  profiles?:
    | { first_name?: string | null; last_name?: string | null }
    | { first_name?: string | null; last_name?: string | null }[]
    | null;
  student_profiles?:
    | { enrollment_id?: string | null }
    | { enrollment_id?: string | null }[]
    | null;
  verified_match_score?: number | null;
  match_score?: number | null;
  verified_ats_score?: number | null;
  ats_score?: number | null;
};
export function SubmissionForm({
  jobId,
  candidates,
}: {
  jobId: string;
  candidates: Candidate[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, applicationIds: selected, notes }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Submission failed");
      router.push(`/placement-hr/submissions/${j.submissionId}`);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {candidates.map((c) => {
          const p = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
          const s = Array.isArray(c.student_profiles)
            ? c.student_profiles[0]
            : c.student_profiles;
          const score = c.verified_match_score ?? c.match_score;
          return (
            <label key={c.id} className="flex gap-3 rounded-lg border p-4">
              <input
                type="checkbox"
                checked={selected.includes(c.id)}
                onChange={(e) =>
                  setSelected((v) =>
                    e.target.checked
                      ? [...v, c.id]
                      : v.filter((x) => x !== c.id),
                  )
                }
              />
              <span>
                <b>
                  {p?.first_name} {p?.last_name}
                </b>
                <span className="block text-sm text-gray-600">
                  {s?.enrollment_id} · Match {score}% · ATS{" "}
                  {c.verified_ats_score ?? c.ats_score ?? "—"}%
                </span>
              </span>
            </label>
          );
        })}
      </div>
      <textarea
        className="w-full rounded-lg border p-3"
        rows={4}
        placeholder="Submission note for Client HR"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        disabled={busy || selected.length === 0}
        onClick={submit}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {busy
          ? "Submitting..."
          : `Submit ${selected.length} Candidate${selected.length === 1 ? "" : "s"}`}
      </button>
    </div>
  );
}
