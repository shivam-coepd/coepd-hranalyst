import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getSecurityOverview() {
  const [failedNotifications, suspendedUsers, openAlerts, rejectedUsers] =
    await Promise.all([
      supabaseAdmin
        .from("notification_outbox")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("status", "failed"),

      supabaseAdmin
        .from("profiles")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("account_status", "suspended"),

      supabaseAdmin
        .from("operational_alerts")
        .select("id", {
          count: "exact",
          head: true,
        })
        .in("status", ["open", "acknowledged"]),

      supabaseAdmin
        .from("profiles")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("account_status", "rejected"),
    ]);

  return {
    failedNotifications: failedNotifications.count ?? 0,

    suspendedUsers: suspendedUsers.count ?? 0,

    openAlerts: openAlerts.count ?? 0,

    rejectedUsers: rejectedUsers.count ?? 0,
  };
}
