"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteJobAction } from "@/app/actions/jobs";
import { Trash2, Edit2 } from "lucide-react";
import Link from "next/link";

export default function JobActions({
  jobId,
  editHref,
  returnHref,
}: {
  jobId: string;
  editHref: string;
  returnHref: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteJobAction(jobId);
      if (result && !result.success) {
        toast.error(result.message || "Failed to delete job");
      } else {
        toast.success("Job deleted successfully");
        router.push(returnHref);
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <Link
        href={editHref}
        className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
      >
        <Edit2 className="h-4 w-4" />
        Edit
      </Link>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 text-red-600 px-4 py-2 text-sm font-medium hover:bg-red-100 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
        {isPending ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
