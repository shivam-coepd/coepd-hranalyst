import { UserRole } from "@/types/auth";

export function getAccountStatusRoute(status: string): string | null {
  switch (status) {
    case "approved":
      return null;
    case "pending":
      return "/pending-approval";
    case "rejected":
      return "/account-rejected";
    case "suspended":
      return "/account-suspended";
    case "inactive":
      return "/account-inactive";
    default:
      return "/unauthorized";
  }
}

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
