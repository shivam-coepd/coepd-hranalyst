import type { UserRole } from "@/types/auth";

export const PERMISSIONS = {
  USERS_READ: "users.read",
  USERS_APPROVE: "users.approve",
  COMPANIES_READ: "companies.read",
  COMPANIES_MANAGE: "companies.manage",
  PROFILE_READ_OWN: "profile.read.own",
  PROFILE_UPDATE_OWN: "profile.update.own",
  SUBMISSIONS_READ: "submissions.read",
  SUBMISSIONS_CREATE: "submissions.create",
  SUBMISSIONS_CV_READ: "submissions.cv.read",
  MOCKS_READ: "mocks.read",
  MOCKS_SCHEDULE: "mocks.schedule",
  MOCKS_BOOK: "mocks.book",
  MOCKS_SCORE: "mocks.score",
  CANDIDATES_DECIDE: "candidates.decide",
  INTERVIEWS_READ: "interviews.read",
  INTERVIEWS_SCHEDULE: "interviews.schedule",
  INTERVIEWS_MANAGE: "interviews.manage",
  FEEDBACKS_READ: "feedbacks.read",
  FEEDBACKS_SUBMIT: "feedbacks.submit",
  FEEDBACKS_REVISE: "feedbacks.revise",
  OFFERS_READ: "offers.read",
  OFFERS_MANAGE: "offers.manage",
  OFFERS_DECIDE: "offers.decide",
  PLACEMENTS_READ: "placements.read",
  PLACEMENTS_CONFIRM: "placements.confirm",
  PLACEMENTS_MANAGE: "placements.manage",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<UserRole, readonly PermissionCode[]> = {
  super_admin: Object.values(PERMISSIONS),
  admin: Object.values(PERMISSIONS),
  placement_hr: [
    PERMISSIONS.COMPANIES_READ,
    PERMISSIONS.PROFILE_READ_OWN,
    PERMISSIONS.PROFILE_UPDATE_OWN,
    PERMISSIONS.SUBMISSIONS_READ,
    PERMISSIONS.SUBMISSIONS_CREATE,
    PERMISSIONS.SUBMISSIONS_CV_READ,
    PERMISSIONS.MOCKS_READ,
    PERMISSIONS.MOCKS_SCHEDULE,
    PERMISSIONS.MOCKS_SCORE,
    PERMISSIONS.INTERVIEWS_READ,
    PERMISSIONS.INTERVIEWS_MANAGE,
    PERMISSIONS.FEEDBACKS_READ,
    PERMISSIONS.FEEDBACKS_SUBMIT,
    PERMISSIONS.FEEDBACKS_REVISE,
    PERMISSIONS.OFFERS_READ,
    PERMISSIONS.OFFERS_MANAGE,
    PERMISSIONS.PLACEMENTS_READ,
    PERMISSIONS.PLACEMENTS_CONFIRM,
    PERMISSIONS.PLACEMENTS_MANAGE,
  ],
  client_hr: [
    PERMISSIONS.COMPANIES_READ,
    PERMISSIONS.PROFILE_READ_OWN,
    PERMISSIONS.PROFILE_UPDATE_OWN,
    PERMISSIONS.SUBMISSIONS_READ,
    PERMISSIONS.SUBMISSIONS_CV_READ,
    PERMISSIONS.CANDIDATES_DECIDE,
    PERMISSIONS.INTERVIEWS_READ,
    PERMISSIONS.INTERVIEWS_SCHEDULE,
    PERMISSIONS.INTERVIEWS_MANAGE,
    PERMISSIONS.FEEDBACKS_READ,
    PERMISSIONS.FEEDBACKS_SUBMIT,
    PERMISSIONS.FEEDBACKS_REVISE,
    PERMISSIONS.OFFERS_READ,
    PERMISSIONS.PLACEMENTS_READ,
  ],
  student: [
    PERMISSIONS.PROFILE_READ_OWN,
    PERMISSIONS.PROFILE_UPDATE_OWN,
    PERMISSIONS.MOCKS_READ,
    PERMISSIONS.MOCKS_BOOK,
    PERMISSIONS.INTERVIEWS_READ,
    PERMISSIONS.FEEDBACKS_READ,
    PERMISSIONS.OFFERS_READ,
    PERMISSIONS.OFFERS_DECIDE,
    PERMISSIONS.PLACEMENTS_READ,
  ],
};

export function roleHasPermission(
  role: UserRole,
  permission: PermissionCode,
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function anyRoleHasPermission(
  roles: readonly UserRole[],
  permission: PermissionCode,
): boolean {
  return roles.some((role) => roleHasPermission(role, permission));
}
