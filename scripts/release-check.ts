import {
  execSync,
} from "node:child_process";

import {
  createClient,
} from "@supabase/supabase-js";


const releaseVersion =
  process.argv[2];


if (!releaseVersion) {
  throw new Error(
    "Usage: npm run release:check -- 1.0.0"
  );
}


const url =
  process.env
    .NEXT_PUBLIC_SUPABASE_URL;

const key =
  process.env
    .SUPABASE_SERVICE_ROLE_KEY;


if (
  !url ||
  !key
) {
  throw new Error(
    "Supabase configuration missing"
  );
}


const supabase =
  createClient(
    url,
    key
  );


function run(
  command:
    string
) {

  console.log(
    `\n> ${command}\n`
  );

  execSync(
    command,
    {
      stdio:
        "inherit",
    }
  );
}


async function main() {

  console.log(
    `Checking release ${releaseVersion}`
  );


  const {
    data:
      uat,
    error:
      uatError,
  } =
    await supabase
      .from("uat_runs")
      .select(`
        status,
        total_tests,
        passed_tests,
        failed_tests
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
      .single();


  if (
    uatError ||
    !uat
  ) {
    throw new Error(
      "UAT result not found"
    );
  }


  if (
    uat.status !==
      "passed"
    ||
    uat.failed_tests !==
      0
    ||
    uat.passed_tests !==
      uat.total_tests
  ) {
    throw new Error(
      "Release blocked: UAT is not fully passed"
    );
  }


  run(
    "npm run typecheck"
  );

  run(
    "npm run build"
  );


  console.log(
    "\nRelease checks PASSED"
  );
}


main()
  .catch(
    error => {

      console.error(
        error
      );

      process.exit(1);
    }
  );