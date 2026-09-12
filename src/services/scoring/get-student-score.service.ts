import "server-only";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/http/route-error";
export async function getStudentScore(applicationId: string) {
  await requireRole("student");
  const supabase = await createClient();
  const { data: app, error } = await supabase
    .from("applications")
    .select(
      "id,status,score_status,match_score,ats_score,verified_match_score,verified_ats_score,verification_notes,rejection_reason,update_request,verified_at,scoring_error,jobs(job_title,job_code,companies(name))",
    )
    .eq("id", applicationId)
    .single();
  if (error || !app)
    throw new AppError("Application not found", 404, "APPLICATION_NOT_FOUND");
  const { data: score } = await supabase
    .from("application_scores")
    .select("*")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  let matches: unknown[] = [];
  if (score) {
    const { data } = await supabase
      .from("application_requirement_matches")
      .select(
        "requirement_type,requirement_name,matched,matched_cv_term,match_method,confidence,evidence",
      )
      .eq("application_score_id", score.id)
      .order("requirement_type");
    matches = data ?? [];
  }
  return { application: app, score, matches };
}
