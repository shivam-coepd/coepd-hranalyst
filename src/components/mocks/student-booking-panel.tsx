"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
type Application = {
  id: string;
  status: string;
  jobs?:
    | { job_title?: string | null; job_code?: string | null }
    | { job_title?: string | null; job_code?: string | null }[]
    | null;
};
type Slot = {
  id: string;
  starts_at: string;
  mode: string;
  duration_minutes: number;
};
export function StudentBookingPanel({
  applications,
  slots,
}: {
  applications: Application[];
  slots: Slot[];
}) {
  const router = useRouter();
  const eligible = useMemo(
    () => applications.filter((a) => a.status !== "mock_scheduled"),
    [applications],
  );
  const [applicationId, setApplicationId] = useState(eligible[0]?.id ?? "");
  const [busySlot, setBusySlot] = useState<string | null>(null);
  const [error, setError] = useState("");
  async function book(slotId: string) {
    if (!applicationId) return;
    setBusySlot(slotId);
    setError("");
    const res = await fetch("/api/mocks/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, slotId }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Unable to book the mock slot");
      setBusySlot(null);
      return;
    }
    router.refresh();
    setBusySlot(null);
  }
  if (!eligible.length) {
    return (
      <p className="text-sm text-gray-500">
        No application is currently eligible for a new mock booking.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      <label className="block text-sm">
        Application
        <select
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
          className="mt-1 w-full max-w-xl rounded-md border p-2"
        >
          {eligible.map((a) => {
            const job = Array.isArray(a.jobs) ? a.jobs[0] : a.jobs;
            return (
              <option key={a.id} value={a.id}>
                {job?.job_title ?? "Job"}{" "}
                {job?.job_code ? `(${job.job_code})` : ""}
              </option>
            );
          })}
        </select>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {slots.map((slot) => (
          <div key={slot.id} className="rounded-xl border p-4">
            <p className="font-medium">
              {new Date(slot.starts_at).toLocaleString()}
            </p>
            <p className="text-sm capitalize">
              {slot.mode} · {slot.duration_minutes} minutes
            </p>
            <button
              disabled={busySlot !== null}
              onClick={() => book(slot.id)}
              className="mt-3 rounded-md bg-black px-3 py-2 text-xs text-white disabled:opacity-50"
            >
              {busySlot === slot.id ? "Booking..." : "Book slot"}
            </button>
          </div>
        ))}
        {slots.length === 0 && (
          <p className="text-sm text-gray-500">
            No available mock slots right now.
          </p>
        )}
      </div>
    </div>
  );
}
