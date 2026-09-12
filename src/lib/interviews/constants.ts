export const INTERVIEW_TYPES = [
  "client",
  "technical",
  "managerial",
  "hr",
  "final",
  "other",
] as const;

export type InterviewType = (typeof INTERVIEW_TYPES)[number];

export const INTERVIEW_MODES = ["online", "offline"] as const;

export type InterviewMode = (typeof INTERVIEW_MODES)[number];

export const INTERVIEW_STATUSES = [
  "scheduled",
  "confirmed",
  "rescheduled",
  "in_progress",
  "completed",
  "cancelled",
  "candidate_no_show",
  "client_no_show",
] as const;

export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

export const DEFAULT_INTERVIEW_DURATION_MINUTES = 60;

export const DEFAULT_TIMEZONE = "Asia/Kolkata";
