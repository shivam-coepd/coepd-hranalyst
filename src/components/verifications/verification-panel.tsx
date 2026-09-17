"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
const checks = [
  ["mustHaveVerified", "Must-have requirements checked"],
  ["cvVerified", "CV details checked"],
  ["experienceVerified", "Experience checked"],
  ["domainVerified", "Domain relevance checked"],
] as const;
type Props = {
  applicationId: string;
  status: string;
  automatedMatchScore: number | null;
  automatedAtsScore: number | null;
  assignment: { assigned_to: string | null } | null;
  currentUserId: string;
};
export default function VerificationPanel(props: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [decision, setDecision] = useState<
    "verified" | "rejected" | "update_requested"
  >("verified");
  const [verifiedMatchScore, setVerifiedMatchScore] = useState(
    props.automatedMatchScore?.toString() ?? "",
  );
  const [verifiedAtsScore, setVerifiedAtsScore] = useState(
    props.automatedAtsScore?.toString() ?? "",
  );
  const [values, setValues] = useState<Record<string, boolean>>({
    mustHaveVerified: false,
    cvVerified: false,
    experienceVerified: false,
    domainVerified: false,
  });
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [updateRequest, setUpdateRequest] = useState("");
  const ownsAssignment = props.assignment?.assigned_to === props.currentUserId;
  const canClaim = props.status === "verification_pending";
  const canFinalize =
    props.status === "under_verification" &&
    (ownsAssignment || !props.assignment);
  const allChecks = useMemo(
    () => Object.values(values).every(Boolean),
    [values],
  );
  async function post(path: string, body?: unknown) {
    setBusy(true);
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Request failed");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }
  async function finalize() {
    await post(
      `/api/applications/${props.applicationId}/verification/finalize`,
      {
        decision,
        verifiedMatchScore:
          verifiedMatchScore === "" ? undefined : Number(verifiedMatchScore),
        verifiedAtsScore:
          verifiedAtsScore === "" ? undefined : Number(verifiedAtsScore),
        ...values,
        notes: notes || undefined,
        rejectionReason: rejectionReason || undefined,
        updateRequest: updateRequest || undefined,
      },
    );
  }
  if (!["verification_pending", "under_verification"].includes(props.status)) {
    return (
      <div className="rounded-xl border p-5 text-sm text-slate-600">
        Verification is already finalized for this application.
      </div>
    );
  }
  return (
    <section className="rounded-xl border p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Placement HR Verification</h2>
          <p className="text-sm text-slate-500">
            Claim the application before finalizing a decision.
          </p>
        </div>
        {canClaim && (
          <button
            disabled={busy}
            onClick={() =>
              post(
                `/api/applications/${props.applicationId}/verification/claim`,
              )
            }
            className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {busy ? "Claiming…" : "Claim Verification"}
          </button>
        )}
        {ownsAssignment && (
          <button
            disabled={busy}
            onClick={() =>
              post(
                `/api/applications/${props.applicationId}/verification/release`,
              )
            }
            className="rounded-lg border px-4 py-2 disabled:opacity-50"
          >
            Release
          </button>
        )}
      </div>

      {props.status === "under_verification" &&
        !ownsAssignment &&
        props.assignment && (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            This application is currently claimed by another verifier.
          </p>
        )}

      {canFinalize && (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">
              Verified Match %
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={verifiedMatchScore}
                onChange={(e) => setVerifiedMatchScore(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Verified ATS %
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={verifiedAtsScore}
                onChange={(e) => setVerifiedAtsScore(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {checks.map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 rounded-lg border p-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={values[key]}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [key]: e.target.checked }))
                  }
                />{" "}
                {label}
              </label>
            ))}
          </div>

          <label className="block text-sm">
            Decision
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value as typeof decision)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="verified">Verify</option>
              <option value="rejected">Reject</option>
              <option value="update_requested">Request CV Update</option>
            </select>
          </label>
          <label className="block text-sm">
            Internal notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 min-h-24 w-full rounded-lg border px-3 py-2"
              maxLength={5000}
            />
          </label>
          {decision === "rejected" && (
            <label className="block text-sm">
              Rejection reason
              <textarea
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-1 min-h-24 w-full rounded-lg border px-3 py-2"
              />
            </label>
          )}
          {decision === "update_requested" && (
            <label className="block text-sm">
              Update request
              <textarea
                required
                value={updateRequest}
                onChange={(e) => setUpdateRequest(e.target.value)}
                className="mt-1 min-h-24 w-full rounded-lg border px-3 py-2"
              />
            </label>
          )}
          {decision === "verified" && Number(verifiedMatchScore || 0) < 60 && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              This candidate can be verified, but client submission will remain
              blocked because the effective Match Score is below 60%.
            </p>
          )}
          <button
            disabled={busy || (decision === "verified" && !allChecks)}
            onClick={finalize}
            className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {busy ? "Saving…" : "Finalize Verification"}
          </button>
        </div>
      )}
    </section>
  );
}
