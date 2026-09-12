import autocannon from "autocannon";

const baseUrl = process.env.PERF_TEST_BASE_URL ?? "http://localhost:3000";

const secret = process.env.PERF_TEST_SECRET;

if (!secret) {
  throw new Error("PERF_TEST_SECRET is required");
}

const concurrency = Number(process.env.PERF_CONCURRENCY ?? 1000);

const duration = Number(process.env.PERF_DURATION_SECONDS ?? 60);

export async function runJobFeedLoad() {
  return autocannon({
    url: `${baseUrl}/api/perf/student-feed?limit=25`,

    connections: concurrency,

    duration,

    pipelining: 1,

    headers: {
      "x-perf-secret": secret,

      Accept: "application/json",
    },

    timeout: 10,
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runJobFeedLoad()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error(error);

      process.exit(1);
    });
}
