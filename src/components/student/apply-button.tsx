"use client";
import { useState } from "react";
import Link from "next/link";
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <button
          onClick={apply}
          disabled={!eligible || busy}
          className="rounded-lg bg-slate-950 px-5 py-2.5 text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-800 transition-colors"
        >
          {busy ? "Applying…" : "Apply with primary CV"}
        </button>
        {eligible && (
          <Link
            href="/student/cv"
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            Change CV
          </Link>
        )}
      </div>
      {msg && <p className="text-sm text-slate-600">{msg}</p>}
    </div>
  );
}
