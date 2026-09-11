import "server-only";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";


export async function
assertReleaseUatPassed(
  releaseVersion:
    string
) {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from("uat_runs")
      .select(`
        id,
        status,
        total_tests,
        passed_tests,
        failed_tests,
        completed_at
      `)
      .eq(
        "release_version",
        releaseVersion
      )
      .eq(
        "environment",
        "staging"
      )
      .order(
        "started_at",
        {
          ascending:
            false,
        }
      )
      .limit(1)
      .maybeSingle();


  if (error) {
    throw new Error(
      error.message
    );
  }


  if (!data) {
    throw new Error(
      "No UAT run found for release"
    );
  }


  if (
    data.status !==
      "passed"
    ||
    data.failed_tests !==
      0
    ||
    data.passed_tests !==
      data.total_tests
  ) {
    throw new Error(
      "Release cannot proceed because UAT has not fully passed"
    );
  }


  return data;
}