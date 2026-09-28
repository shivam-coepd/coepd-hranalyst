"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  interviewId: string;
};

export function CompleteInterviewButton({ interviewId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function complete() {
    if (!confirm("Are you sure you want to mark this interview as completed?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/client/interviews/${interviewId}/complete`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to complete interview");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete interview");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={complete}
        disabled={loading}
        className="rounded-md bg-green-600 hover:bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
      >
        {loading ? "Completing..." : "Mark as Completed"}
      </button>
    </div>
  );
}
