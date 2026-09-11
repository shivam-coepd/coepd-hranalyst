"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

type Props = {
  interviewId:
    string;
};

export function
InterviewFeedbackForm({
  interviewId,
}: Props) {

  const router =
    useRouter();

  const [
    rating,
    setRating,
  ] =
    useState(5);

  const [
    decision,
    setDecision,
  ] =
    useState<
      "selected"
      | "rejected"
      | "on_hold"
    >("selected");

  const [
    reasonCode,
    setReasonCode,
  ] =
    useState("");

  const [
    comments,
    setComments,
  ] =
    useState("");

  const [
    visible,
    setVisible,
  ] =
    useState(true);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  async function submit(
    event:
      React.FormEvent
  ) {

    event.preventDefault();

    setLoading(true);
    setError(null);

    try {

      const response =
        await fetch(
          "/api/feedbacks",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                interviewId,
                rating,
                decision,
                reasonCode:
                  reasonCode ||
                  undefined,
                comments:
                  comments ||
                  undefined,
                visibleToStudent:
                  visible,
              }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
          "Unable to submit feedback"
        );
      }

      router.refresh();

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit feedback"
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-xl border bg-white p-6"
    >

      <h2 className="text-lg font-semibold">
        Interview Feedback
      </h2>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">
          Rating
        </label>

        <select
          value={rating}
          onChange={event =>
            setRating(
              Number(
                event.target.value
              )
            )
          }
          className="w-full rounded-md border px-3 py-2"
        >
          <option value={5}>
            5 - Excellent
          </option>
          <option value={4}>
            4 - Good
          </option>
          <option value={3}>
            3 - Average
          </option>
          <option value={2}>
            2 - Below Average
          </option>
          <option value={1}>
            1 - Poor
          </option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Decision
        </label>

        <select
          value={decision}
          onChange={event =>
            setDecision(
              event.target
                .value as
                | "selected"
                | "rejected"
                | "on_hold"
            )
          }
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="selected">
            Selected
          </option>

          <option value="on_hold">
            On Hold
          </option>

          <option value="rejected">
            Rejected
          </option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Reason Code
        </label>

        <select
          value={
            reasonCode
          }
          onChange={event =>
            setReasonCode(
              event.target.value
            )
          }
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="">
            Select
          </option>

          <option value="strong_fit">
            Strong Fit
          </option>

          <option value="technical_gap">
            Technical Gap
          </option>

          <option value="domain_gap">
            Domain Gap
          </option>

          <option value="communication_gap">
            Communication Gap
          </option>

          <option value="compensation">
            Compensation
          </option>

          <option value="position_on_hold">
            Position On Hold
          </option>

          <option value="other">
            Other
          </option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Comments
        </label>

        <textarea
          rows={5}
          value={comments}
          onChange={event =>
            setComments(
              event.target.value
            )
          }
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={visible}
          onChange={event =>
            setVisible(
              event.target.checked
            )
          }
        />

        Share comments with student
      </label>

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading
          ? "Submitting..."
          : "Submit Feedback"}
      </button>

    </form>
  );
}