"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
type Evaluator = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

export function CreateMockSlotForm({
  evaluators,
}: {
  evaluators: Evaluator[];
}) {
  const r = useRouter();
  const [e, setE] = useState("");
  async function submit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    const body = {
      evaluatorUserId: String(f.get("evaluatorUserId")),
      scheduledAt: new Date(String(f.get("scheduledAt"))).toISOString(),
      durationMinutes: Number(f.get("durationMinutes")),
      mode: String(f.get("mode")),
      meetingLink: String(f.get("meetingLink") || "") || undefined,
      location: String(f.get("location") || "") || undefined,
    };
    const res = await fetch("/api/mocks/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await res.json();
    if (!res.ok) {
      setE(j.error ?? "Unable to create slot");
      return;
    }
    ev.currentTarget.reset();
    r.refresh();
  }
  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border p-5">
      <h2 className="font-semibold">Create Student-bookable Slot</h2>
      <select
        name="evaluatorUserId"
        required
        className="w-full rounded-md border p-2"
      >
        {evaluators.map((x) => (
          <option key={x.id} value={x.id}>
            {x.first_name} {x.last_name}
          </option>
        ))}
      </select>
      <input
        name="scheduledAt"
        type="datetime-local"
        required
        className="w-full rounded-md border p-2"
      />
      <input
        name="durationMinutes"
        type="number"
        min="15"
        max="240"
        defaultValue="60"
        className="w-full rounded-md border p-2"
      />
      <select name="mode" className="w-full rounded-md border p-2">
        <option value="online">Online</option>
        <option value="offline">Offline</option>
      </select>
      <input
        name="meetingLink"
        type="url"
        placeholder="Meeting link for online"
        className="w-full rounded-md border p-2"
      />
      <input
        name="location"
        placeholder="Location for offline"
        className="w-full rounded-md border p-2"
      />
      {e && <p className="text-sm text-red-600">{e}</p>}
      <button className="rounded-md border px-4 py-2 text-sm">
        Create Slot
      </button>
    </form>
  );
}
