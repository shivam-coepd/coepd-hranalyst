import "server-only";
import { requireAdmin } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface UpdateUserInput {
  firstName: string;
  lastName: string;
  phone: string;
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  const admin = await requireAdmin();

  const { data: before, error: findError } = await supabaseAdmin
    .from("profiles")
    .select("first_name, last_name, phone")
    .eq("id", userId)
    .single();

  if (findError || !before) {
    throw new Error("User not found");
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone || null,
    })
    .eq("id", userId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to update user profile");
  }

  await supabaseAdmin.from("audit_logs").insert({
    actor_id: admin.id,
    entity_type: "user",
    entity_id: userId,
    action: "USER_UPDATED",
    old_values: before,
    new_values: {
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
    },
  });

  return data;
}
