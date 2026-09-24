import "server-only";
import { requireServiceRole } from "@/lib/auth/service-guard";
import { supabaseAdmin } from "@/lib/supabase/admin";
export async function listScoringApplications() {
  const user = await requireServiceRole([
    "super_admin",
    "admin",
    "placement_hr",
  ]);
  let q = supabaseAdmin
    .from("applications")
    .select(
      "id,status,score_status,match_score,ats_score,verified_match_score,verified_ats_score,applied_at,jobs!inner(id,job_title,job_code,assigned_placement_hr),student_profiles(user_id,enrollment_id,profiles(first_name,last_name))",
    )
    .in("status", ["scoring_pending", "scoring", "scoring_failed"])
    .order("applied_at", { ascending: false });
  // if (
  //   user.roles.includes("placement_hr") &&
  //   !user.roles.some((r) => r === "admin" || r === "super_admin")
  // )
  //   q = q.eq("jobs.assigned_placement_hr", user.id);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  
  const rows = data ?? [];
  if (user.roles.some((r) => r === "admin" || r === "super_admin")) {
    return rows;
  }
  
  return rows.filter((row) => {
    const job = Array.isArray(row.jobs) ? row.jobs[0] : row.jobs;
    const assigned = job?.assigned_placement_hr;
    return !assigned || assigned === user.id;
  });
}
