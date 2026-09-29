import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { UserRole } from "./roles";

export const requireUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, first_name, last_name, account_status")
    .eq("id", user.id)
    .single();

  if (error || !profile) redirect("/login");

  switch (profile.account_status) {
    case "pending": redirect("/pending-approval");
    case "rejected": redirect("/account-rejected");
    case "suspended": redirect("/account-suspended");
    case "inactive": redirect("/account-inactive");
    case "approved": break;
    default: redirect("/unauthorized");
  }

  return {
    ...user,
    profile,
    firstName: profile.first_name,
    lastName: profile.last_name,
    accountStatus: profile.account_status,
  };
});

export const getCurrentRoles = cache(async (userId: string): Promise<UserRole[]> => {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("roles!inner(name)")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((row) => (Array.isArray(row.roles) ? row.roles[0] : row.roles)?.name as UserRole | undefined)
    .filter((role): role is UserRole => Boolean(role));
});

export const requireRole = cache(async (allowedRoles: UserRole | readonly UserRole[]) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch profile and roles in parallel to save 100-200ms!
  const [profileRes, rolesRes] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, email, first_name, last_name, account_status").eq("id", user.id).single(),
    supabaseAdmin.from("user_roles").select("roles!inner(name)").eq("user_id", user.id)
  ]);

  if (profileRes.error || !profileRes.data) redirect("/login");
  const profile = profileRes.data;

  switch (profile.account_status) {
    case "pending": redirect("/pending-approval");
    case "rejected": redirect("/account-rejected");
    case "suspended": redirect("/account-suspended");
    case "inactive": redirect("/account-inactive");
    case "approved": break;
    default: redirect("/unauthorized");
  }

  const userRoles = (rolesRes.data ?? [])
    .map((row) => (Array.isArray(row.roles) ? row.roles[0] : row.roles)?.name as UserRole | undefined)
    .filter((role): role is UserRole => Boolean(role));

  const allowed = userRoles.some((role) =>
    (typeof allowedRoles === "string" ? [allowedRoles] : allowedRoles).includes(role)
  );

  if (!allowed) redirect("/unauthorized");

  return {
    ...user,
    profile,
    firstName: profile.first_name,
    lastName: profile.last_name,
    accountStatus: profile.account_status,
    roles: userRoles,
  };
});

export async function requireAdmin() {
  return requireRole(["super_admin", "admin"]);
}

export async function requireSuperAdmin() {
  return requireRole(["super_admin"]);
}
