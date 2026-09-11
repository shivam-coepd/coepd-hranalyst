import { UserRole } from "@/types/auth";

export function getDashboardRoute(roles: UserRole[]) {
  if (roles.includes("super_admin")) {
    return "/admin";
  }

  if (roles.includes("admin")) {
    return "/admin";
  }

  if (roles.includes("placement_hr")) {
    return "/placement-hr";
  }

  if (roles.includes("client_hr")) {
    return "/client";
  }

  if (roles.includes("student")) {
    return "/student";
  }

  return "/unauthorized";
}