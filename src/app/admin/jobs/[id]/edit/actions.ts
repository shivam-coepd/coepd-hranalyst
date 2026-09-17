"use server";
import { redirect } from "next/navigation";
import { updateJob } from "@/services/jobs/update-job.service";
import type { JobInput } from "@/lib/validators/job.schema";
import type { State } from "@/app/placement-hr/jobs/new/actions";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function updateJobAction(
  jobId: string,
  _: State,
  fd: FormData,
): Promise<State> {
  const raw: Record<string, any> = {};
  for (const [key, value] of fd.entries()) {
    if (!key.startsWith("$")) {
      raw[key] = value;
    }
  }

  let success = false;

  try {
    const dataToSubmit = { ...raw };
    for (const k of [
      "experienceMaxMonths",
      "salaryMin",
      "salaryMax",
      "assignedPlacementHr",
    ]) {
      if (dataToSubmit[k] === "") delete dataToSubmit[k];
    }
    
    await updateJob(jobId, dataToSubmit as unknown as JobInput);
    revalidatePath(`/admin/jobs/${jobId}`);
    revalidatePath("/admin/jobs");
    success = true;
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Unable to update job",
      fields: raw,
    };
  }

  if (success) {
    redirect(`/admin/jobs/${jobId}`);
  }
  return { success: false, message: "An unexpected error occurred" };
}
