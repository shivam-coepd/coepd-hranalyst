import { createClient } from "@/lib/supabase/server";

export async function getAdminDashboardMetrics() {
  const supabase = await createClient();

  const [pendingUsers, approvedStudents, companies, placementHR, activeJobs, recentJobs, upcomingInterviews] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("account_status", "pending"),
      supabase
        .from("student_profiles")
        .select("*", { count: "exact", head: true })
        .eq("verification_status", "verified"),
      supabase.from("companies").select("*", { count: "exact", head: true }),
      supabase
        .from("placement_hr_profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("jobs")
        .select("id, job_code, job_title, status, created_at, companies(name)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("interviews")
        .select("id, scheduled_at, status, round_number, applications!inner(student_id, jobs(job_title))")
        .gte("scheduled_at", new Date().toISOString())
        .in("status", ["scheduled"])
        .order("scheduled_at", { ascending: true })
        .limit(5),
    ]);

  return {
    pendingUsers: pendingUsers.count ?? 0,
    approvedStudents: approvedStudents.count ?? 0,
    companies: companies.count ?? 0,
    placementHR: placementHR.count ?? 0,
    activeJobs: activeJobs.count ?? 0,
    recentJobs: recentJobs.data ?? [],
    upcomingInterviews: upcomingInterviews.data ?? [],
  };
}
