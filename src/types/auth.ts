export const USER_ROLES = [
  "super_admin",
  "admin",
  "placement_hr",
  "client_hr",
  "student",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ACCOUNT_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "suspended",
  "inactive",
] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export interface CurrentUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  accountStatus: AccountStatus;
  roles: UserRole[];
}

export interface AuthActionState {
  success: boolean;
  message: string;
}
