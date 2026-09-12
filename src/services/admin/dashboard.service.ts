import { createClient } from "@/lib/supabase/server";

export async function getAdminDashboardMetrics() {
  const supabase = await createClient();

  const [pendingUsers, approvedStudents, companies, placementHR] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("account_status", "pending"),

      supabase
        .from("student_profiles")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("verification_status", "verified"),

      supabase.from("companies").select("*", {
        count: "exact",
        head: true,
      }),

      supabase
        .from("placement_hr_profiles")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("is_active", true),
    ]);

  return {
    pendingUsers: pendingUsers.count ?? 0,

    approvedStudents: approvedStudents.count ?? 0,

    companies: companies.count ?? 0,

    placementHR: placementHR.count ?? 0,
  };
}
