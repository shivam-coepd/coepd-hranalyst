"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { CLIENT_REJECTION_REASONS } from "@/lib/client/rejection-reasons";

type Props = {
  submissionCandidateId: string;
  currentStatus: string;
};

export function ClientDecisionActions({
  submissionCandidateId,
  currentStatus,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [showReject, setShowReject] = useState(false);

  const [reasonCode, setReasonCode] = useState("");

  const [reason, setReason] = useState("");

  const [error, setError] = useState<string | null>(null);

  async function submitDecision(decision: "shortlisted" | "rejected") {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/client/candidates/${submissionCandidateId}/decision`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            decision,
            reasonCode: reasonCode || undefined,
            reason: reason || undefined,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save decision");
      }

      setShowReject(false);

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save decision");
    } finally {
      setLoading(false);
    }
  }

  if (currentStatus === "shortlisted") {
    return (
      <div className="rounded-lg border bg-green-50 p-4 text-sm font-medium text-green-800">
        Candidate shortlisted
      </div>
    );
  }

  if (currentStatus === "rejected") {
    return (
      <div className="rounded-lg border bg-red-50 p-4 text-sm font-medium text-red-800">
        Candidate rejected
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!showReject && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => submitDecision("shortlisted")}
            className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Saving..." : "Shortlist Candidate"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => setShowReject(true)}
            className="rounded-md border px-5 py-2.5 text-sm font-medium"
          >
            Reject Candidate
          </button>
        </div>
      )}

      {showReject && (
        <div className="max-w-xl space-y-4 rounded-lg border p-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Rejection reason
            </label>

            <select
              value={reasonCode}
              onChange={(event) => setReasonCode(event.target.value)}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">Select reason</option>

              {CLIENT_REJECTION_REASONS.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Comments</label>

            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Enter the reason for rejection"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              disabled={loading || reason.trim().length === 0}
              onClick={() => submitDecision("rejected")}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Confirm Rejection
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => setShowReject(false)}
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
