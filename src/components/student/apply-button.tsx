"use client";
import { useState } from "react";
export default function ApplyButton({
  jobId,
  eligible,
  reason,
}: {
  jobId: string;
  eligible: boolean;
  reason?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(reason ?? "");
  async function apply() {
    setBusy(true);
    setMsg("");
    const r = await fetch("/api/applications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jobId }),
    });
    const j = await r.json();
    setMsg(
      r.ok
        ? "Application submitted. Match and ATS scoring will run next."
        : j.error || "Unable to apply",
    );
    setBusy(false);
  }
  return (
    <div>
      <button
        onClick={apply}
        disabled={!eligible || busy}
        className="rounded-lg bg-slate-950 px-5 py-2.5 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Applying…" : "Apply with primary CV"}
      </button>
      {msg && <p className="mt-2 text-sm text-slate-600">{msg}</p>}
    </div>
  );
}
