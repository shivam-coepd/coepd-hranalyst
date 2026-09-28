"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function WithdrawApplicationButton({
  applicationId,
}: {
  applicationId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleWithdraw = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/applications/${applicationId}/withdraw`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to withdraw application");
      }

      toast.success("Application withdrawn", {
        description: "Your application has been successfully removed.",
      });

      setOpen(false);
      router.push("/student/applications");
      router.refresh();
    } catch (error: any) {
      toast.error("Error", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="sm" className="px-4 py-5">
            <Trash2 className="mr-2 h-4 w-4" />
            Withdraw Application
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently withdraw and delete your
            application, along with any scheduled interviews, HR feedback, or placement scores
            associated with it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleWithdraw}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Withdrawal
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog >
  );
}
