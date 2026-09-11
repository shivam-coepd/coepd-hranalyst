import "server-only";

import { requireAdmin } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/services/audit/audit.service";
import type { AccountStatus } from "@/types/auth";

async function assertApprovalPrerequisites(userId: string): Promise<void> {
  const { data: roleRows, error } = await supabaseAdmin
    .from("user_roles")
    .select("role_id")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);

  const roleIds = (roleRows ?? []).map((row) => row.role_id);
  const { data: roles, error: rolesError } = roleIds.length
    ? await supabaseAdmin.from("roles").select("name").in("id", roleIds)
    : { data: [], error: null };
  if (rolesError) throw new Error(rolesError.message);

  const names = (roles ?? []).map((r) => r.name);

  if (names.includes("student")) {
    const { data: student } = await supabaseAdmin
      .from("student_profiles")
      .select("verification_status")
      .eq("user_id", userId)
      .single();
    if (!student || student.verification_status !== "verified") {
      throw new Error("Student must be verified against HRAnalyst before approval");
    }
  }

  if (names.includes("client_hr")) {
    const { data: client } = await supabaseAdmin
      .from("client_hr_profiles")
      .select("company_id")
      .eq("user_id", userId)
      .single();
    if (!client) throw new Error("Client HR profile is missing");

    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("verification_status,is_active,deleted_at")
      .eq("id", client.company_id)
      .single();
    if (!company || company.verification_status !== "verified" || !company.is_active || company.deleted_at) {
      throw new Error("Client HR company must be verified and active before approval");
    }
  }
}

export async function changeUserStatus(
  userId: string,
  nextStatus: AccountStatus,
  reason?: string,
) {
  const admin = await requireAdmin();

  if (admin.id === userId && ["rejected", "suspended", "inactive"].includes(nextStatus)) {
    throw new Error("You cannot disable your own account");
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id,account_status")
    .eq("id", userId)
    .single();
  if (profileError || !profile) throw new Error("User not found");

  if (nextStatus === "approved") await assertApprovalPrerequisites(userId);

  if ((nextStatus === "rejected" || nextStatus === "suspended") && !reason?.trim()) {
    throw new Error("A reason is required");
  }

  const now = new Date().toISOString();
  const update: Record<string, unknown> = {
    account_status: nextStatus,
    updated_at: now,
  };

  if (nextStatus === "approved") {
    update.approved_at = now;
    update.approved_by = admin.id;
    update.rejection_reason = null;
    update.suspended_at = null;
    update.suspended_by = null;
    update.suspension_reason = null;
    update.inactive_at = null;
    update.inactive_by = null;
    update.inactivation_reason = null;
  } else if (nextStatus === "rejected") {
    update.approved_at = null;
    update.approved_by = null;
    update.rejection_reason = reason!.trim();
  } else if (nextStatus === "suspended") {
    update.suspended_at = now;
    update.suspended_by = admin.id;
    update.suspension_reason = reason!.trim();
  } else if (nextStatus === "inactive") {
    update.inactive_at = now;
    update.inactive_by = admin.id;
    update.inactivation_reason = reason?.trim() || null;
  }

  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update(update)
    .eq("id", userId);
  if (updateError) throw new Error(updateError.message);

  await writeAuditLog({
    actorUserId: admin.id,
    entityType: "user",
    entityId: userId,
    action: `USER_${nextStatus.toUpperCase()}`,
    oldData: { status: profile.account_status },
    newData: { status: nextStatus, reason: reason?.trim() || null },
  });

  return { success: true as const };
}
