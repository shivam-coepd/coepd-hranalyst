"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function MockScorecardForm({ mockId }: { mockId: string }) {
  const r = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const body = {
      communicationScore: Number(f.get("communication")),
      technicalScore: Number(f.get("technical")),
      domainScore: Number(f.get("domain")),
      strengths: String(f.get("strengths") || ""),
      improvementAreas: String(f.get("improvements") || ""),
      evaluatorNotes: String(f.get("internalNotes") || ""),
      studentVisibleNotes: String(f.get("studentNotes") || ""),
      recommendation: String(f.get("recommendation")),
    };
    const res = await fetch(`/api/mocks/${mockId}/scorecard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Unable to submit scorecard");
      setBusy(false);
      return;
    }
    (e.target as HTMLFormElement).reset();
    r.refresh();
    setBusy(false);
  }
  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border p-5">
      <h2 className="text-lg font-semibold">Mock Scorecard</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["communication", "Communication"],
          ["technical", "Technical"],
          ["domain", "Domain"],
        ].map(([n, l]) => (
          <label key={n} className="text-sm">
            {l}
            <input
              name={n}
              type="number"
              min="0"
              max="100"
              step="0.01"
              required
              className="mt-1 w-full rounded-md border p-2"
            />
          </label>
        ))}
      </div>
      <label className="block text-sm">
        Recommendation
        <select
          name="recommendation"
          className="mt-1 w-full rounded-md border p-2"
        >
          <option value="ready">Ready</option>
          <option value="ready_with_minor_improvement">
            Ready with minor improvement
          </option>
          <option value="needs_another_mock">Needs another mock</option>
          <option value="not_ready">Not ready</option>
        </select>
      </label>
      {[
        ["strengths", "Strengths"],
        ["improvements", "Improvement Areas"],
        ["studentNotes", "Notes visible to Student"],
        ["internalNotes", "Internal evaluator notes"],
      ].map(([n, l]) => (
        <label key={n} className="block text-sm">
          {l}
          <textarea
            name={n}
            rows={3}
            className="mt-1 w-full rounded-md border p-2"
          />
        </label>
      ))}
      <p className="text-xs text-gray-500">
        Overall score uses the existing project rule: Communication 30% +
        Technical 40% + Domain 30%.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        disabled={busy}
        className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {busy ? "Submitting..." : "Submit Scorecard"}
      </button>
    </form>
  );
}
