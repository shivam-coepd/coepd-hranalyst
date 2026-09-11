import type { UserRole } from "@/types/auth";
import type { JobStatus } from "@/services/jobs/job-status";

export function canViewJob({
  userRoles,
  ownsCompany = false,
  assignedToUser = false,
  status,
}: {
  userRoles: readonly UserRole[];
  ownsCompany?: boolean;
  assignedToUser?: boolean;
  status: JobStatus;
}) {
  if (userRoles.some((r) => r === "super_admin" || r === "admin")) return true;
  if (userRoles.includes("placement_hr"))
    return (
      assignedToUser || status === "pending_checklist" || status === "published"
    );
  if (userRoles.includes("client_hr")) return ownsCompany;
  if (userRoles.includes("student")) return status === "published";
  return false;
}

export function canEditJob({
  userRoles,
  jobStatus,
  ownsCompany,
  assignedToUser = false,
}: {
  userRoles: readonly UserRole[];
  jobStatus: JobStatus;
  ownsCompany: boolean;
  assignedToUser?: boolean;
}) {
  if (jobStatus !== "draft") return false;
  if (userRoles.some((r) => r === "super_admin" || r === "admin")) return true;
  if (userRoles.includes("placement_hr")) return assignedToUser;
  if (userRoles.includes("client_hr")) return ownsCompany;
  return false;
}

export function canSubmitJob(args: {
  userRoles: readonly UserRole[];
  ownsCompany: boolean;
  assignedToUser?: boolean;
  jobStatus: JobStatus;
}) {
  return canEditJob(args);
}
export function canAssignHR(userRoles: readonly UserRole[]) {
  return userRoles.some(
    (r) => r === "super_admin" || r === "admin" || r === "placement_hr",
  );
}
export function canGenerateChecklist(userRoles: readonly UserRole[]) {
  return userRoles.some(
    (r) => r === "super_admin" || r === "admin" || r === "placement_hr",
  );
}
export function canPublishJob(userRoles: readonly UserRole[]) {
  return userRoles.some(
    (r) => r === "super_admin" || r === "admin" || r === "placement_hr",
  );
}
export function canCloseJob(userRoles: readonly UserRole[]) {
  return userRoles.some(
    (r) => r === "super_admin" || r === "admin" || r === "placement_hr",
  );
}
