export const ACCOUNT_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "suspended",
  "inactive",
] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];
