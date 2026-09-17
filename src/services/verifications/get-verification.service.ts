import "server-only";
import { requireServiceRole } from "@/lib/auth/service-guard";
import { AppError } from "@/lib/http/route-error";
import {
  getVerificationContext,
  listVerificationQueue,
} from "@/repositories/verifications.repository";
function relationOne(value: unknown) {
  return Array.isArray(value) ? value[0] : value;
}
export async function getVerification(applicationId: string) {
  const user = await requireServiceRole([
    "super_admin",
    "admin",
    "placement_hr",
  ]);
  const result = await getVerificationContext(applicationId);
  if (!result)
    throw new AppError("Application not found", 404, "APPLICATION_NOT_FOUND");
  const job = relationOne(result.application.jobs);
  if (
    user.roles.includes("placement_hr") &&
    !user.roles.some((r) => r === "admin" || r === "super_admin")
  ) {
    if (job?.assigned_placement_hr !== user.id)
      throw new AppError(
        "This application is not assigned to you",
        403,
        "FORBIDDEN",
      );
  }
  return { ...result, currentUserId: user.id };
}
export async function getVerificationQueue() {
  const user = await requireServiceRole([
    "super_admin",
    "admin",
    "placement_hr",
  ]);
  const rows = await listVerificationQueue();
  if (user.roles.some((r) => r === "admin" || r === "super_admin")) return rows;
  return rows.filter(
    (row) => relationOne(row.jobs)?.assigned_placement_hr === user.id,
  );
}
