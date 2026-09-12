export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",

  ADMIN: "admin",

  PLACEMENT_HR: "placement_hr",

  CLIENT_HR: "client_hr",

  STUDENT: "student",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_VALUES: UserRole[] = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
  USER_ROLES.PLACEMENT_HR,
  USER_ROLES.CLIENT_HR,
  USER_ROLES.STUDENT,
];

export const ADMIN_ROLES: UserRole[] = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
];

export const INTERNAL_HR_ROLES: UserRole[] = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
  USER_ROLES.PLACEMENT_HR,
];
