"use server";

import { deleteJob } from "@/services/jobs/delete-job.service";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function deleteJobAction(jobId: string) {
  try {
    await deleteJob(jobId);
    revalidatePath("/admin/jobs");
    revalidatePath("/placement-hr/jobs");
    return { success: true };
  } catch (e: any) {
    if (isRedirectError(e)) throw e;
    return {
      success: false,
      message: e.message || "Failed to delete job",
    };
  }
}
