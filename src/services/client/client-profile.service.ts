import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

import { requireRole } from "@/lib/auth/guards";

export async function requireActiveClientHr() {
  const user = await requireRole(["client_hr"]);

  const { data, error } = await supabaseAdmin
    .from("client_hr_profiles")
    .select(
      `
        user_id,
        company_id,
        work_email,
        is_active
      `,
    )
    .eq("user_id", user.id)
    .single();

  if (error || !data || !data.is_active) {
    throw new Error("Active Client HR profile required");
  }

  return {
    user,
    clientProfile: data,
  };
}
