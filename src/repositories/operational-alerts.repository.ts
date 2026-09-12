import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getOperationalAlerts() {
  const { data, error } = await supabaseAdmin
    .from("operational_alerts")
    .select(
      `
        id,
        alert_type,
        entity_type,
        entity_id,
        severity,
        title,
        description,
        status,
        due_at,
        created_at
      `,
    )
    .in("status", ["open", "acknowledged"])
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
