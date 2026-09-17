"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { approveUserAction, rejectUserAction, suspendUserAction, deleteUserAction } from "./actions";

export default function UserApprovalActions({
  userId,
  status,
}: {
  userId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      const result = await approveUserAction(userId);
      if (result.success) {
        toast.success("User approved successfully");
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleReject() {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason) return;

    startTransition(async () => {
      const result = await rejectUserAction(userId, reason);
      if (result.success) {
        toast.success("User rejected");
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleSuspend() {
    const reason = window.prompt("Enter suspension reason:");
    if (!reason) return;

    startTransition(async () => {
      const result = await suspendUserAction(userId, reason);
      if (result.success) {
        toast.success("User suspended");
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this user? This action cannot be undone."
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteUserAction(userId);
      // If it returns, it means it failed. Because on success, it redirects.
      if (result && !result.success) {
        toast.error(result.message || "Unable to delete user");
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/admin/users/${userId}/edit`}
        className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
      >
        Edit profile
      </Link>

      {status === "pending" && (
        <>
          <button
            onClick={handleReject}
            disabled={isPending}
            className="rounded border border-red-200 text-red-700 hover:bg-red-50 px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="rounded bg-green-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Approve
          </button>
        </>
      )}

      {status === "approved" && (
        <button
          onClick={handleSuspend}
          disabled={isPending}
          className="rounded border border-red-200 text-red-700 hover:bg-red-50 px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          Suspend
        </button>
      )}

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
