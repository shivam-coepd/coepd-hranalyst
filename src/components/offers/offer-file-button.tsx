"use client";

import { useState } from "react";

type Props = {
  offerId: string;
};

export function OfferFileButton({ offerId }: Props) {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function openFile() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/offers/${offerId}/file`);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to open offer");
      }

      window.open(result.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open offer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={openFile}
        disabled={loading}
        className="rounded-md border px-4 py-2 text-sm font-medium"
      >
        {loading ? "Opening..." : "View Offer Letter"}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
