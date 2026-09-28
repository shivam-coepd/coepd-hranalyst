import "server-only";
import { requireRole } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getStudentDashboard() {
  const user = await requireRole("student");
  const { data: student, error } = await supabaseAdmin
    .from("student_profiles")
    .select(
      "id,enrollment_id,verification_status,profile_completion,profile_status,first_name,last_name,preferred_role",
    )
    .eq("user_id", user.id)
    .single();
  if (error || !student) throw new Error("Student profile not found");
  const [
    { count: cvCount },
    { count: applicationCount },
    { count: publishedJobs },
    { data: recentApplications },
    { data: upcomingInterviews },
  ] = await Promise.all([
    supabaseAdmin
      .from("student_cvs")
      .select("id", { count: "exact", head: true })
      .eq("student_id", student.id)
      .is("deleted_at", null),
    supabaseAdmin
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("student_id", student.id),
    supabaseAdmin
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .is("deleted_at", null),
    supabaseAdmin
      .from("applications")
      .select("id, status, created_at, jobs(job_code, job_title)")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabaseAdmin
      .from("interviews")
      .select("id, scheduled_at, status, round_number, applications!inner(student_id, jobs(job_title))")
      .eq("applications.student_id", student.id)
      .gte("scheduled_at", new Date().toISOString())
      .in("status", ["scheduled"])
      .order("scheduled_at", { ascending: true })
      .limit(5),
  ]);
  return {
    student,
    cvCount: cvCount ?? 0,
    applicationCount: applicationCount ?? 0,
    publishedJobs: publishedJobs ?? 0,
    recentApplications: recentApplications ?? [],
    upcomingInterviews: upcomingInterviews ?? [],
  };
}
