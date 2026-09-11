import autocannon from "autocannon";

const baseUrl = process.env.PERF_TEST_BASE_URL ?? "http://localhost:3000";

async function main() {
  const result = await autocannon({
    url: `${baseUrl}/api/readiness`,

    connections: 100,

    duration: 30,

    pipelining: 1,
  });

  console.log(
    JSON.stringify(
      {
        requests: result.requests,

        latency: result.latency,

        errors: result.errors,

        timeouts: result.timeouts,

        non2xx: result.non2xx,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);

  process.exit(1);
});
