import "server-only";

import { createClient } from "@/lib/supabase/server";

import { requireRole } from "@/lib/auth/guards";

export async function getClientAnalytics() {
  await requireRole(["client_hr"]);

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_client_company_analytics");

  if (error) {
    throw new Error(error.message);
  }

  return data as {
    open_jobs: number;
    submitted_candidates: number;
    shortlisted: number;
    interviews: number;
    selected: number;
    placements: number;
  };
}
