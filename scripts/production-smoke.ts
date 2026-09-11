const baseUrl =
  process.env
    .PRODUCTION_BASE_URL;


if (!baseUrl) {
  throw new Error(
    "PRODUCTION_BASE_URL is required"
  );
}


type SmokeResult = {

  name:
    string;

  url:
    string;

  expectedStatus:
    number[];

  actualStatus:
    number;

  passed:
    boolean;

  durationMs:
    number;
};


async function check(
  name:
    string,
  path:
    string,
  expectedStatus:
    number[]
): Promise<SmokeResult> {

  const url =
    `${baseUrl}${path}`;


  const started =
    performance.now();


  const response =
    await fetch(
      url,
      {
        redirect:
          "manual",
      }
    );


  const duration =
    performance.now()
    -
    started;


  return {

    name,

    url,

    expectedStatus,

    actualStatus:
      response.status,

    passed:
      expectedStatus
        .includes(
          response.status
        ),

    durationMs:
      Number(
        duration
          .toFixed(2)
      ),

  };
}


async function main() {

  const checks =
    await Promise.all([

      check(
        "Health",
        "/api/health",
        [
          200,
        ]
      ),

      check(
        "Readiness",
        "/api/readiness",
        [
          200,
        ]
      ),

      check(
        "Login",
        "/login",
        [
          200,
        ]
      ),

      check(
        "Admin Protection",
        "/admin",
        [
          302,
          307,
          308,
        ]
      ),

      check(
        "Student Protection",
        "/student",
        [
          302,
          307,
          308,
        ]
      ),

      check(
        "Client Protection",
        "/client",
        [
          302,
          307,
          308,
        ]
      ),

      check(
        "Placement HR Protection",
        "/placement-hr",
        [
          302,
          307,
          308,
        ]
      ),

    ]);


  console.table(
    checks.map(
      item => ({

        Check:
          item.name,

        Status:
          item.actualStatus,

        Duration:
          `${item.durationMs}ms`,

        Result:
          item.passed
            ? "PASS"
            : "FAIL",

      })
    )
  );


  const failed =
    checks.filter(
      item =>
        !item.passed
    );


  if (
    failed.length >
    0
  ) {

    console.error(
      `${failed.length} smoke tests failed`
    );

    process.exit(1);
  }


  console.log(
    "Production smoke tests passed"
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