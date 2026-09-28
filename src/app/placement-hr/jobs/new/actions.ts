"use server";
import { redirect } from "next/navigation";
import { createJob } from "@/services/jobs/create-job.service";
import type { JobInput } from "@/lib/validators/job.schema";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export type State = {
  success: boolean;
  message: string;
  fields?: Record<string, any>;
};

export async function createJobAction(_: State, fd: FormData): Promise<State> {
  const raw: Record<string, any> = {};
  for (const [key, value] of fd.entries()) {
    if (!key.startsWith("$")) {
      raw[key] = value;
    }
  }

  let jobId: string | undefined;
  let success = false;

  try {
    const dataToSubmit = { ...raw };
    for (const k of [
      "experienceMaxYears",
      "salaryMin",
      "salaryMax",
      "assignedPlacementHr",
    ]) {
      if (dataToSubmit[k] === "") delete dataToSubmit[k];
    }
    const j = await createJob(dataToSubmit as unknown as JobInput);
    jobId = j.id;
    success = true;
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Unable to create job",
      fields: raw,
    };
  }

  if (success && jobId) {
    redirect(`/placement-hr/jobs/${jobId}`);
  }
  
  return { success: false, message: "An unexpected error occurred" };
}
