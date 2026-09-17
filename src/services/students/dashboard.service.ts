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
  ]);
  return {
    student,
    cvCount: cvCount ?? 0,
    applicationCount: applicationCount ?? 0,
    publishedJobs: publishedJobs ?? 0,
  };
}
