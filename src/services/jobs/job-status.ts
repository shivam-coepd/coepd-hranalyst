export type JobStatus =
  | "draft"
  | "pending_checklist"
  | "published"
  | "paused"
  | "closed"
  | "cancelled";

export const JOB_TRANSITIONS:
  Record<JobStatus, JobStatus[]> = {

  draft: [
    "pending_checklist",
    "cancelled",
  ],

  pending_checklist: [
    "draft",
  ],

  published: [
    "paused",
    "closed",
  ],

  paused: [
    "published",
    "closed",
  ],

  closed: [],

  cancelled: [],
};

export function canTransitionJob(
  from: JobStatus,
  to: JobStatus
) {
  return JOB_TRANSITIONS[
    from
  ].includes(to);
}