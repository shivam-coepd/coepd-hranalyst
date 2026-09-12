"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validators/login.schema";
import { getDashboardRoute } from "@/lib/auth/dashboard-route";
import type { UserRole } from "@/types/auth";
export async function loginAction(
  _previousState: {
    success: boolean;
    message: string;
  },
  formData: FormData,
) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid login details",
    };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    return {
      success: false,
      message: "Invalid email or password",
    };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      message: "Authentication failed",
    };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
      account_status,
      user_roles!user_id (
        roles (
          name
        )
      )
    `,
    )
    .eq("id", user.id)
    .single();
  if (!profile) {
    await supabase.auth.signOut();
    return {
      success: false,
      message: "User profile not found",
    };
  }
  if (profile.account_status === "pending") {
    redirect("/pending-approval");
  }
  if (profile.account_status === "rejected") {
    redirect("/account-rejected");
  }
  if (profile.account_status === "suspended") {
    redirect("/account-suspended");
  }
  if (profile.account_status !== "approved") {
    redirect("/account-inactive");
  }
  const roles = (profile.user_roles ?? [])
    .map((row) => row.roles?.name)
    .filter((role): role is UserRole => Boolean(role));
  redirect(getDashboardRoute(roles));
}
