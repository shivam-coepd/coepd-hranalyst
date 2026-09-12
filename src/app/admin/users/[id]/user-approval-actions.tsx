"use client";

import { useState } from "react";

import { approveUserAction, rejectUserAction } from "./actions";

export default function UserApprovalActions({
  userId,
  status,
}: {
  userId: string;
  status: string;
}) {
  const [loading, setLoading] = useState(false);

  async function approve() {
    setLoading(true);

    const result = await approveUserAction(userId);

    setLoading(false);

    if (!result.success) {
      alert(result.message);
    }
  }

  async function reject() {
    const reason = window.prompt("Enter rejection reason");

    if (!reason) {
      return;
    }

    setLoading(true);

    const result = await rejectUserAction(userId, reason);

    setLoading(false);

    if (!result.success) {
      alert(result.message);
    }
  }

  if (status !== "pending") {
    return null;
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={reject}
        disabled={loading}
        className="rounded-lg border px-4 py-2 text-sm font-medium"
      >
        Reject
      </button>

      <button
        onClick={approve}
        disabled={loading}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Approve
      </button>
    </div>
  );
}
