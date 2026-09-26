import "server-only";

import { createClient } from "@/lib/supabase/server";

import { requireRole } from "@/lib/auth/guards";
import { requireActiveClientHr } from "@/services/client/client-profile.service";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getClientAnalytics() {
  await requireRole(["client_hr"]);

  const supabase = await createClient();

  const { clientProfile } = await requireActiveClientHr();

  const [metrics, { data: recentSubmissions }, { data: upcomingInterviews }] = await Promise.all([
    supabase.rpc("get_client_company_analytics"),
    supabaseAdmin
      .from("submissions")
      .select("id, submission_code, candidate_count, submitted_at, jobs(job_code, job_title)")
      .eq("company_id", clientProfile.company_id)
      .neq("status", "cancelled")
      .order("submitted_at", { ascending: false })
      .limit(5),
    supabaseAdmin
      .from("interviews")
      .select("id, scheduled_at, status, round_number, applications!inner(student_id, jobs!inner(company_id, job_title))")
      .eq("applications.jobs.company_id", clientProfile.company_id)
      .gte("scheduled_at", new Date().toISOString())
      .in("status", ["scheduled"])
      .order("scheduled_at", { ascending: true })
      .limit(5),
  ]);

  if (metrics.error) {
    throw new Error(metrics.error.message);
  }

  return {
    metrics: metrics.data as {
      open_jobs: number;
      submitted_candidates: number;
      shortlisted: number;
      interviews: number;
      selected: number;
      placements: number;
    },
    recentSubmissions: recentSubmissions ?? [],
    upcomingInterviews: upcomingInterviews ?? [],
  };
}
