"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
type Application = {
  id: string;
  profile?: { first_name?: string | null; last_name?: string | null } | null;
  jobs?:
    | { job_title?: string | null; job_code?: string | null }
    | { job_title?: string | null; job_code?: string | null }[]
    | null;
};
type Evaluator = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
};
export function ScheduleMockForm({
  applications,
  evaluators,
}: {
  applications: Application[];
  evaluators: Evaluator[];
}) {
  const r = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    const body = {
      applicationId: String(f.get("applicationId")),
      evaluatorUserId: String(f.get("evaluatorUserId")),
      scheduledAt: new Date(String(f.get("scheduledAt"))).toISOString(),
      durationMinutes: Number(f.get("durationMinutes")),
      mode: String(f.get("mode")),
      meetingLink: String(f.get("meetingLink") || "") || undefined,
      location: String(f.get("location") || "") || undefined,
    };
    const res = await fetch("/api/mocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await res.json();
    if (!res.ok) {
      setError(j.error ?? "Unable to schedule mock");
      setBusy(false);
      return;
    }
    r.push(`/placement-hr/mocks/${j.mockId}`);
    r.refresh();
  }
  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-xl border bg-white p-5"
    >
      <h2 className="font-semibold">Schedule Mock Interview</h2>
      <label className="block text-sm">
        Candidate/Application
        <select
          name="applicationId"
          required
          className="mt-1 w-full rounded-md border p-2"
        >
          <option value="">Select</option>
          {applications.map((a) => {
            const job = Array.isArray(a.jobs) ? a.jobs[0] : a.jobs;
            return (
              <option key={a.id} value={a.id}>
                {a.profile?.first_name} {a.profile?.last_name} —{" "}
                {job?.job_title ?? "Job"}
              </option>
            );
          })}
        </select>
      </label>
      <label className="block text-sm">
        Evaluator
        <select
          name="evaluatorUserId"
          required
          className="mt-1 w-full rounded-md border p-2"
        >
          {evaluators.map((u) => (
            <option key={u.id} value={u.id}>
              {u.first_name} {u.last_name} ({u.email})
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm">
          Schedule
          <input
            name="scheduledAt"
            type="datetime-local"
            required
            className="mt-1 w-full rounded-md border p-2"
          />
        </label>
        <label className="text-sm">
          Duration
          <input
            name="durationMinutes"
            type="number"
            min="15"
            max="240"
            defaultValue="60"
            className="mt-1 w-full rounded-md border p-2"
          />
        </label>
        <label className="text-sm">
          Mode
          <select name="mode" className="mt-1 w-full rounded-md border p-2">
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </label>
      </div>
      <label className="block text-sm">
        Meeting link
        <input
          name="meetingLink"
          type="url"
          className="mt-1 w-full rounded-md border p-2"
        />
      </label>
      <label className="block text-sm">
        Offline location
        <input name="location" className="mt-1 w-full rounded-md border p-2" />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        disabled={busy}
        className="rounded-md bg-black px-4 py-2 text-sm text-white"
      >
        {busy ? "Scheduling..." : "Schedule Mock"}
      </button>
    </form>
  );
}
