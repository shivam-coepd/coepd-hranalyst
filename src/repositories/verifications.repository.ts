import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getVerificationContext(applicationId: string) {
  const { data: application, error } = await supabaseAdmin
    .from("applications")
    .select(
      `
      id, job_id, student_id, status, score_status,
      match_score, ats_score, verified_match_score, verified_ats_score,
      verification_notes, rejection_reason, update_request, verified_by, verified_at,
      verification_due_at, applied_at,
      jobs(id, job_title, job_code, assigned_placement_hr, companies(name)),
      student_profiles(id, user_id, enrollment_id, first_name, last_name)
    `,
    )
    .eq("id", applicationId)
    .maybeSingle();

  if (error) throw error;
  if (!application) return null;

  const [{ data: assignment }, { data: verifications }] = await Promise.all([
    supabaseAdmin
      .from("verification_assignments")
      .select("*")
      .eq("application_id", applicationId)
      .eq("status", "active")
      .order("claimed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabaseAdmin
      .from("application_verifications")
      .select("*")
      .eq("application_id", applicationId)
      .order("verified_at", { ascending: false }),
  ]);

  return {
    application,
    assignment: assignment ?? null,
    verifications: verifications ?? [],
  };
}

export async function listVerificationQueue() {
  const { data, error } = await supabaseAdmin
    .from("applications")
    .select(
      `
      id, status, score_status, match_score, ats_score,
      verified_match_score, verified_ats_score, verification_due_at, applied_at,
      jobs(id, job_title, job_code, assigned_placement_hr, companies(name)),
      student_profiles(id, enrollment_id, first_name, last_name)
    `,
    )
    .in("status", ["verification_pending", "under_verification"])
    .order("verification_due_at", { ascending: true, nullsFirst: false })
    .order("applied_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
