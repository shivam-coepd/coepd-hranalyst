import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function resolveRecipient(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(
      `
        id,
        email,
        phone,
        first_name,
        last_name
      `,
    )
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error("Notification recipient not found");
  }

  return data;
}
