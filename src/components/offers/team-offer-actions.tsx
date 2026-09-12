"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { offerId: string; status: string };

export function TeamOfferActions({ offerId, status }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"withdraw" | "confirm" | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function withdraw() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/offers/${offerId}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Unable to withdraw offer");
      setMode(null);
      setReason("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to withdraw offer");
    } finally {
      setLoading(false);
    }
  }

  async function confirmPlacement() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/placements/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId, notes: reason || undefined }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Unable to confirm placement");
      router.push(`/placement-hr/placements/${result.placementId}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to confirm placement",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {status === "accepted" && (
          <button
            type="button"
            onClick={() => setMode("confirm")}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Confirm Placement
          </button>
        )}
        {["uploaded", "sent_to_student", "accepted"].includes(status) && (
          <button
            type="button"
            onClick={() => setMode("withdraw")}
            className="rounded-md border px-4 py-2 text-sm font-medium"
          >
            Withdraw Offer
          </button>
        )}
      </div>
      {mode && (
        <div className="max-w-2xl space-y-3 rounded-xl border bg-white p-4">
          <h3 className="font-semibold">
            {mode === "withdraw" ? "Withdraw Offer" : "Confirm Placement"}
          </h3>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder={
              mode === "withdraw"
                ? "Withdrawal reason (required)"
                : "Placement confirmation notes (optional)"
            }
            className="w-full rounded-md border px-3 py-2"
          />
          <div className="flex gap-3">
            <button
              type="button"
              disabled={loading || (mode === "withdraw" && !reason.trim())}
              onClick={mode === "withdraw" ? withdraw : confirmPlacement}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : mode === "withdraw"
                  ? "Confirm Withdrawal"
                  : "Create Placement"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(null);
                setError(null);
              }}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
