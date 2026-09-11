import "server-only";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

import {
  UAT_TESTS,
} from "@/lib/uat/tests";


export async function
createUatRun({
  releaseVersion,
  executedBy,
}: {
  releaseVersion:
    string;

  executedBy:
    string;
}) {

  const runCode =
    `UAT-${releaseVersion}-${Date.now()}`;


  const {
    data:
      run,
    error:
      runError,
  } =
    await supabaseAdmin
      .from("uat_runs")
      .insert({

        run_code:
          runCode,

        environment:
          "staging",

        release_version:
          releaseVersion,

        executed_by:
          executedBy,

        total_tests:
          UAT_TESTS.length,

        status:
          "running",

      })
      .select(
        "id,run_code"
      )
      .single();


  if (
    runError ||
    !run
  ) {
    throw new Error(
      runError?.message ??
      "Unable to create UAT run"
    );
  }


  const rows =
    UAT_TESTS.map(
      test => ({

        uat_run_id:
          run.id,

        test_code:
          test.code,

        area:
          test.area,

        actor_role:
          test.role,

        description:
          test.description,

        expected_result:
          test.expected,

        status:
          "not_run",

      })
    );


  const {
    error:
      testError,
  } =
    await supabaseAdmin
      .from(
        "uat_test_results"
      )
      .insert(
        rows
      );


  if (testError) {
    throw new Error(
      testError.message
    );
  }


  return run;
}


export async function
updateUatResult({
  runId,
  testCode,
  status,
  actualResult,
  evidence,
}: {
  runId:
    string;

  testCode:
    string;

  status:
    "passed"
    | "failed"
    | "blocked"
    | "not_run";

  actualResult?:
    string;

  evidence?:
    string;
}) {

  const {
    error,
  } =
    await supabaseAdmin
      .from(
        "uat_test_results"
      )
      .update({

        status,

        actual_result:
          actualResult ??
          null,

        evidence:
          evidence ??
          null,

        executed_at:
          new Date()
            .toISOString(),

      })
      .eq(
        "uat_run_id",
        runId
      )
      .eq(
        "test_code",
        testCode
      );


  if (error) {
    throw new Error(
      error.message
    );
  }


  await refreshUatTotals(
    runId
  );
}


export async function
refreshUatTotals(
  runId:
    string
) {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        "uat_test_results"
      )
      .select(
        "status"
      )
      .eq(
        "uat_run_id",
        runId
      );


  if (error) {
    throw new Error(
      error.message
    );
  }


  const rows =
    data ?? [];


  const passed =
    rows.filter(
      row =>
        row.status ===
        "passed"
    ).length;


  const failed =
    rows.filter(
      row =>
        row.status ===
          "failed"
        ||
        row.status ===
          "blocked"
    ).length;


  const remaining =
    rows.filter(
      row =>
        row.status ===
        "not_run"
    ).length;


  const completed =
    remaining ===
    0;


  const status =
    completed
      ? failed > 0
        ? "failed"
        : "passed"
      : "running";


  const {
    error:
      updateError,
  } =
    await supabaseAdmin
      .from("uat_runs")
      .update({

        passed_tests:
          passed,

        failed_tests:
          failed,

        status,

        completed_at:
          completed
            ? new Date()
                .toISOString()
            : null,

      })
      .eq(
        "id",
        runId
      );


  if (updateError) {
    throw new Error(
      updateError.message
    );
  }
}