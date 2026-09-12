"use client";
import { useState } from "react";
export function ClientCvButton({ candidateId }: { candidateId: string }) {
  const [busy, setBusy] = useState(false);
  async function open() {
    setBusy(true);
    try {
      const r = await fetch(`/api/client/candidates/${candidateId}/cv`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Unable to open CV");
      window.open(j.url, "_blank", "noopener,noreferrer");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Unable to open CV");
    } finally {
      setBusy(false);
    }
  }
  return (
    <button
      onClick={open}
      disabled={busy}
      className="rounded border px-3 py-2 text-sm"
    >
      {busy ? "Opening..." : "View CV"}
    </button>
  );
}
