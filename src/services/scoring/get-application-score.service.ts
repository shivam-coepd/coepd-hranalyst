import "server-only";
import { requireServiceRole } from "@/lib/auth/service-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AppError } from "@/lib/http/route-error";
export async function getApplicationScore(applicationId: string) {
  const user = await requireServiceRole([
    "super_admin",
    "admin",
    "placement_hr",
  ]);
  const { data: app, error } = await supabaseAdmin
    .from("applications")
    .select(
      "id,job_id,status,match_score,ats_score,score_status,scoring_error,jobs(job_title,job_code,assigned_placement_hr),student_profiles(user_id,enrollment_id,profiles(first_name,last_name))",
    )
    .eq("id", applicationId)
    .single();
  if (error || !app)
    throw new AppError("Application not found", 404, "APPLICATION_NOT_FOUND");
  const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
  if (
    user.roles.includes("placement_hr") &&
    !user.roles.some((r) => r === "admin" || r === "super_admin") &&
    job?.assigned_placement_hr && 
    job?.assigned_placement_hr !== user.id
  )
    throw new AppError(
      "This application is assigned to another HR",
      403,
      "FORBIDDEN",
    );
  const { data: score } = await supabaseAdmin
    .from("application_scores")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  let matches: unknown[] = [];
  if (score) {
    const { data } = await supabaseAdmin
      .from("application_requirement_matches")
      .select("*")
      .eq("application_score_id", score.id)
      .order("requirement_type");
    matches = data ?? [];
  }
  return { application: app, score, matches };
}
