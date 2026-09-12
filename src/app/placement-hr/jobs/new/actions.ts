"use server";
import { redirect } from "next/navigation";
import { createJob } from "@/services/jobs/create-job.service";
import type { JobInput } from "@/lib/validators/job.schema";
type State = {
  success: boolean;
  message: string;
};
export async function createJobAction(_: State, fd: FormData): Promise<State> {
  try {
    const o = Object.fromEntries(fd.entries());
    for (const k of [
      "experienceMaxMonths",
      "salaryMin",
      "salaryMax",
      "assignedPlacementHr",
    ])
      if (o[k] === "") delete o[k];
    const j = await createJob(o as unknown as JobInput);
    redirect(`/placement-hr/jobs/${j.id}`);
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : "Unable to create job",
    };
  }
}
