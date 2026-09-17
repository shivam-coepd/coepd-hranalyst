export const ACCOUNT_STATUSES = {
  PENDING: "pending",

  APPROVED: "approved",

  REJECTED: "rejected",

  SUSPENDED: "suspended",

  INACTIVE: "inactive",
} as const;

export type AccountStatus =
  (typeof ACCOUNT_STATUSES)[keyof typeof ACCOUNT_STATUSES];

export const ACCOUNT_STATUS_VALUES: AccountStatus[] = [
  ACCOUNT_STATUSES.PENDING,
  ACCOUNT_STATUSES.APPROVED,
  ACCOUNT_STATUSES.REJECTED,
  ACCOUNT_STATUSES.SUSPENDED,
  ACCOUNT_STATUSES.INACTIVE,
];
