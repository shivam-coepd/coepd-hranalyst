"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

type Props = {
  submissionCandidateId: string;
  disabled?: boolean;
  disabledReason?: string | null;
};

export function InterviewScheduleForm({
  submissionCandidateId,
  disabled = false,
  disabledReason = null,
}: Props) {
  const router = useRouter();

  const [roundNumber, setRoundNumber] = useState(1);

  const [roundName, setRoundName] = useState("Round 1");

  const [interviewType, setInterviewType] = useState("technical");

  const [scheduledAt, setScheduledAt] = useState("");

  const [durationMinutes, setDurationMinutes] = useState(60);

  const [timezone, setTimezone] = useState("Asia/Kolkata");

  const [mode, setMode] = useState<"online" | "offline">("online");

  const [meetingProvider, setMeetingProvider] = useState("Google Meet");

  const [meetingLink, setMeetingLink] = useState("");

  const [location, setLocation] = useState("");

  const [instructions, setInstructions] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!scheduledAt) {
        throw new Error("Interview date and time are required");
      }

      const isoDate = new Date(scheduledAt).toISOString();

      const response = await fetch("/api/client/interviews", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          submissionCandidateId,
          roundNumber,
          roundName,
          interviewType,
          scheduledAt: isoDate,
          durationMinutes,
          timezone,
          mode,
          meetingProvider: mode === "online" ? meetingProvider : undefined,
          meetingLink: mode === "online" ? meetingLink : undefined,
          location: mode === "offline" ? location : undefined,
          instructions: instructions || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to schedule interview");
      }

      setSuccess(true);

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to schedule interview",
      );
    } finally {
      setLoading(false);
    }
  }

  if (disabled) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {disabledReason ??
          "Candidate is not eligible for interview scheduling."}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border bg-white p-6"
    >
      <h3 className="text-lg font-semibold">Schedule Client Interview</h3>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Interview scheduled successfully.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Round number</label>

          <input
            type="number"
            min={1}
            max={20}
            value={roundNumber}
            onChange={(event) => setRoundNumber(Number(event.target.value))}
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Round name</label>

          <input
            value={roundName}
            onChange={(event) => setRoundName(event.target.value)}
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Interview type
          </label>

          <select
            value={interviewType}
            onChange={(event) => setInterviewType(event.target.value)}
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="technical">Technical</option>
            <option value="managerial">Managerial</option>
            <option value="hr">HR</option>
            <option value="final">Final</option>
            <option value="client">Client</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Date & time</label>

          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Duration</label>

          <select
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(Number(event.target.value))}
            className="w-full rounded-md border px-3 py-2"
          >
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
            <option value={120}>120 minutes</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Timezone</label>

          <input
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Mode</label>

          <select
            value={mode}
            onChange={(event) =>
              setMode(event.target.value as "online" | "offline")
            }
            className="w-full rounded-md border px-3 py-2"
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        {mode === "online" && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Meeting provider
              </label>

              <select
                value={meetingProvider}
                onChange={(event) => setMeetingProvider(event.target.value)}
                className="w-full rounded-md border px-3 py-2"
              >
                <option value="Google Meet">Google Meet</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="Zoom">Zoom</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Meeting link
              </label>

              <input
                type="url"
                value={meetingLink}
                onChange={(event) => setMeetingLink(event.target.value)}
                className="w-full rounded-md border px-3 py-2"
                required
              />
            </div>
          </>
        )}

        {mode === "offline" && (
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">
              Interview location
            </label>

            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="w-full rounded-md border px-3 py-2"
              required
            />
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Candidate instructions
        </label>

        <textarea
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
          rows={4}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Scheduling..." : "Schedule Interview"}
      </button>
    </form>
  );
}
