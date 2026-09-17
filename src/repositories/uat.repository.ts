import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getUatRuns() {
  const { data, error } = await supabaseAdmin
    .from("uat_runs")
    .select(
      `
        id,
        run_code,
        environment,
        release_version,
        started_at,
        completed_at,
        status,
        total_tests,
        passed_tests,
        failed_tests
      `,
    )
    .order("started_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getUatRun(id: string) {
  const { data, error } = await supabaseAdmin
    .from("uat_runs")
    .select(
      `
        id,
        run_code,
        environment,
        release_version,
        started_at,
        completed_at,
        status,
        total_tests,
        passed_tests,
        failed_tests,
        notes,

        uat_test_results (
          id,
          test_code,
          area,
          actor_role,
          description,
          expected_result,
          actual_result,
          status,
          evidence,
          executed_at
        )
      `,
    )
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
