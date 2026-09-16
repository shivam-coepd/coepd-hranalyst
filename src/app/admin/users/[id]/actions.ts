"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";
export async function approveUserAction(userId: string) {
  const admin = await requireAdmin();
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, account_status")
    .eq("id", userId)
    .single();
  if (profileError || !profile) {
    return {
      success: false,
      message: "User not found",
    };
  }
  if (profile.account_status === "approved") {
    return {
      success: false,
      message: "User is already approved",
    };
  }
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      account_status: "approved",
      approved_by: admin.id,
      approved_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq("id", userId);
  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }
  await supabaseAdmin.from("audit_logs").insert({
    actor_id: admin.id,
    entity_type: "user",
    entity_id: userId,
    action: "USER_APPROVED",
    old_values: {
      status: profile.account_status,
    },
    new_values: {
      status: "approved",
    },
  });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return {
    success: true,
    message: "User approved successfully",
  };
}
export async function rejectUserAction(userId: string, reason: string) {
  const admin = await requireAdmin();
  if (!reason.trim()) {
    return {
      success: false,
      message: "Rejection reason is required",
    };
  }
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("account_status")
    .eq("id", userId)
    .single();
  if (!profile) {
    return {
      success: false,
      message: "User not found",
    };
  }
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      account_status: "rejected",
      rejection_reason: reason.trim(),
      approved_by: null,
      approved_at: null,
    })
    .eq("id", userId);
  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }
  await supabaseAdmin.from("audit_logs").insert({
    actor_id: admin.id,
    entity_type: "user",
    entity_id: userId,
    action: "USER_REJECTED",
    old_values: {
      status: profile.account_status,
    },
    new_values: {
      status: "rejected",
      reason,
    },
  });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return {
    success: true,
  };
}
export async function suspendUserAction(userId: string, reason: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) {
    return {
      success: false,
      message: "You cannot suspend your own account",
    };
  }
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("account_status")
    .eq("id", userId)
    .single();
  if (!profile) {
    return {
      success: false,
      message: "User not found",
    };
  }
  await supabaseAdmin
    .from("profiles")
    .update({
      account_status: "suspended",
    })
    .eq("id", userId);
  await supabaseAdmin.from("audit_logs").insert({
    actor_id: admin.id,
    entity_type: "user",
    entity_id: userId,
    action: "USER_SUSPENDED",
    old_values: {
      status: profile.account_status,
    },
    new_values: {
      status: "suspended",
      reason,
    },
  });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return {
    success: true,
  };
}

export async function deleteUserAction(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) {
    return {
      success: false,
      message: "You cannot delete your own account",
    };
  }
  
  // Log the deletion before we actually delete the user
  await supabaseAdmin.from("audit_logs").insert({
    actor_id: admin.id,
    entity_type: "user",
    entity_id: userId,
    action: "USER_DELETED",
    old_values: { status: "deleted" },
    new_values: {},
  });

  // This will cascade and delete the user's profile and roles as well
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  
  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function adminUpdateUserPasswordAction(userId: string, newPassword: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) {
    return {
      success: false,
      message: "Please use the normal Change Password feature to update your own password",
    };
  }

  if (newPassword.length < 8) {
    return {
      success: false,
      message: "Password must be at least 8 characters",
    };
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  await supabaseAdmin.from("audit_logs").insert({
    actor_id: admin.id,
    entity_type: "user",
    entity_id: userId,
    action: "USER_PASSWORD_RESET",
    old_values: {},
    new_values: { password_reset: true },
  });

  return { success: true };
}
