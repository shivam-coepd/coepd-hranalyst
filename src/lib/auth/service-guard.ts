import "server-only";

import { AppError } from "@/lib/http/route-error";
import { getCurrentUser } from "@/services/users/current-user.service";
import type { UserRole } from "@/types/auth";

export async function requireServiceRole(
  allowedRoles: UserRole | readonly UserRole[],
) {
  const user = await getCurrentUser();
  if (!user)
    throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
  if (user.accountStatus !== "approved")
    throw new AppError("Account is not active", 403, "ACCOUNT_INACTIVE");

  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!user.roles.some((role) => allowed.includes(role))) {
    throw new AppError(
      "You do not have permission to perform this action",
      403,
      "FORBIDDEN",
    );
  }
  return user;
}
