export const USER_ROLES = [
  "super_admin",
  "admin",
  "placement_hr",
  "client_hr",
  "student",
  "mock_evaluator",
] as const;
                                          
export type UserRole =
  (typeof USER_ROLES)[number];

export const ADMIN_ROLES:
  UserRole[] =
[
  "super_admin",
  "admin",
];

export const PLACEMENT_TEAM_ROLES:
  UserRole[] =
[
  "super_admin",
  "admin",
  "placement_hr",
];