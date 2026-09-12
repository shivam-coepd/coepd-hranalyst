"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

type Props = {
  offerId: string;
  status: string;
};

export function StudentOfferActions({ offerId, status }: Props) {
  const router = useRouter();

  const [declineMode, setDeclineMode] = useState(false);

  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function decide(decision: "accepted" | "declined") {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/student/offers/${offerId}/decision`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          decision,
          reason: reason || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to save decision");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save decision");
    } finally {
      setLoading(false);
    }
  }

  if (!["uploaded", "sent_to_student"].includes(status)) {
    return (
      <div className="rounded-md bg-gray-50 p-4 text-sm font-medium capitalize">
        Offer status: {status}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!declineMode ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => decide("accepted")}
            className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white"
          >
            Accept Offer
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => setDeclineMode(true)}
            className="rounded-md border px-5 py-2.5 text-sm font-medium"
          >
            Decline Offer
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            placeholder="Why are you declining this offer?"
            className="w-full rounded-md border px-3 py-2"
          />

          <div className="flex gap-3">
            <button
              type="button"
              disabled={loading || !reason.trim()}
              onClick={() => decide("declined")}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white"
            >
              Confirm Decline
            </button>

            <button
              type="button"
              onClick={() => setDeclineMode(false)}
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
