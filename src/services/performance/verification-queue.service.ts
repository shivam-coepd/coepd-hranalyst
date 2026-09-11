import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getPerformanceVerificationQueue() {
  const { data, error } = await supabaseAdmin
    .from("applications")
    .select(
      `
        id,
        job_id,
        student_id,
        match_score,
        verified_match_score,
        ats_score,
        verified_ats_score,
        verification_due_at,
        created_at,

        jobs!inner (
          job_code,
          job_title,

          companies!inner (
            name
          )
        ),

        student_profiles!inner (
          enrollment_id,
          first_name,
          last_name
        )
      `,
    )
    .eq("status", "verification_pending")
    .order("verification_due_at", {
      ascending: true,

      nullsFirst: false,
    })
    .order("created_at", {
      ascending: true,
    })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
