import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

import type { UserRole } from "./roles";

export async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select(
      `
        id,
        email,
        first_name,
        last_name,
        account_status
      `,
    )
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/login");
  }

  switch (profile.account_status) {
    case "pending":
      redirect("/pending-approval");

    case "rejected":
      redirect("/account-rejected");

    case "suspended":
      redirect("/account-suspended");

    case "inactive":
      redirect("/account-inactive");
    case "approved":
      break;
    default:
      redirect("/unauthorized");
  }

  return {
    ...user,
    profile,
    firstName: profile.first_name,
    lastName: profile.last_name,
    accountStatus: profile.account_status,
  };
}

export async function getCurrentRoles(userId: string): Promise<UserRole[]> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select(
      `
        roles!inner (
          name
        )
      `,
    )
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((row) => {
      const role = Array.isArray(row.roles) ? row.roles[0] : row.roles;

      return role?.name as UserRole | undefined;
    })
    .filter((role): role is UserRole => Boolean(role));
}

export async function requireRole(
  allowedRoles: UserRole | readonly UserRole[],
) {
  const user = await requireUser();

  const roles = await getCurrentRoles(user.id);

  const allowed = roles.some((role) =>
    (typeof allowedRoles === "string" ? [allowedRoles] : allowedRoles).includes(
      role,
    ),
  );

  if (!allowed) {
    redirect("/unauthorized");
  }

  return {
    ...user,
    roles,
  };
}

export async function requireAdmin() {
  return requireRole(["super_admin", "admin"]);
}

export async function requireSuperAdmin() {
  return requireRole(["super_admin"]);
}
