"use client";
import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  verifyCompanyAction,
  rejectCompanyAction,
  toggleCompanyActiveAction,
} from "@/app/admin/companies/[id]/actions";

export default function CompanyActions({
  companyId,
  status,
  active,
}: {
  companyId: string;
  status: string;
  active: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleVerify() {
    startTransition(async () => {
      const result = await verifyCompanyAction(companyId);
      if (result.success) {
        toast.success("Company verified successfully");
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleReject() {
    const reason = window.prompt("Rejection reason:");
    if (!reason) return;
    
    startTransition(async () => {
      const result = await rejectCompanyAction(companyId, reason);
      if (result.success) {
        toast.success("Company rejected");
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleToggleActive() {
    startTransition(async () => {
      const result = await toggleCompanyActiveAction(companyId, !active);
      if (result.success) {
        toast.success(`Company ${!active ? "activated" : "deactivated"} successfully`);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={`/admin/companies/${companyId}/edit`}
        className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
      >
        Edit company
      </Link>
      
      {status !== "verified" && (
        <button
          disabled={isPending}
          onClick={handleVerify}
          className="rounded bg-green-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Verify
        </button>
      )}
      {status !== "rejected" && (
        <button
          disabled={isPending}
          onClick={handleReject}
          className="rounded bg-red-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Reject
        </button>
      )}
      <button
        disabled={isPending}
        onClick={handleToggleActive}
        className="rounded border px-3 py-2 text-sm font-medium disabled:opacity-50"
      >
        {active ? "Deactivate" : "Activate"}
      </button>
    </div>
  );
}
