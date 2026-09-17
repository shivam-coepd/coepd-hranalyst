"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  feedbackId: string;
  current: {
    rating: number | null;
    decision: "selected" | "rejected" | "on_hold";
    reasonCode: string | null;
    comments: string | null;
    visibleToStudent: boolean;
  };
};

export function InterviewFeedbackRevisionForm({ feedbackId, current }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/feedbacks/${feedbackId}/revise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: form.get("rating") ? Number(form.get("rating")) : undefined,
          decision: String(form.get("decision") ?? ""),
          reasonCode: String(form.get("reasonCode") ?? "") || undefined,
          comments: String(form.get("comments") ?? "") || undefined,
          visibleToStudent: form.get("visibleToStudent") === "on",
          revisionReason: String(form.get("revisionReason") ?? ""),
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Unable to revise feedback");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to revise feedback",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border px-4 py-2 text-sm font-medium"
      >
        Revise Feedback
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-xl border bg-white p-5"
    >
      <h3 className="font-semibold">Revise Feedback</h3>
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <select
          name="decision"
          defaultValue={current.decision}
          className="rounded-md border px-3 py-2"
        >
          <option value="selected">Selected</option>
          <option value="on_hold">On Hold</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          name="rating"
          type="number"
          min="1"
          max="5"
          step="0.1"
          defaultValue={current.rating ?? ""}
          placeholder="Rating (1-5)"
          className="rounded-md border px-3 py-2"
        />
      </div>
      <input
        name="reasonCode"
        defaultValue={current.reasonCode ?? ""}
        placeholder="Reason code (optional)"
        className="w-full rounded-md border px-3 py-2"
      />
      <textarea
        name="comments"
        defaultValue={current.comments ?? ""}
        rows={4}
        placeholder="Feedback comments"
        className="w-full rounded-md border px-3 py-2"
      />
      <textarea
        name="revisionReason"
        required
        rows={3}
        placeholder="Why is this feedback being revised?"
        className="w-full rounded-md border px-3 py-2"
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="visibleToStudent"
          defaultChecked={current.visibleToStudent}
        />{" "}
        Visible to student
      </label>
      <div className="flex gap-3">
        <button
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Revision"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
