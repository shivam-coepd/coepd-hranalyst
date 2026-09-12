import { createClient } from "@/lib/supabase/server";

export async function getStudentApplications() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
        id,
        status,
        match_score,
        ats_score,
        score_status,
        applied_at,

        jobs (
          id,
          job_code,
          job_title,
          role_type,
          location,
          workplace_type,

          companies (
            name,
            logo
          )
        )
      `,
    )
    .order("applied_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
