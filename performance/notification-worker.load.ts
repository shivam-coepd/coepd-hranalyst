import autocannon from "autocannon";

const baseUrl = process.env.PERF_TEST_BASE_URL ?? "http://localhost:3000";
const secret = process.env.PERF_TEST_SECRET;

if (!secret) throw new Error("PERF_TEST_SECRET is required");

export async function runNotificationWorkerLoad() {
  return autocannon({
    url: `${baseUrl}/api/perf/notification-worker`,
    method: "POST",
    connections: Math.min(Number(process.env.PERF_CONCURRENCY ?? 10), 50),
    duration: Number(process.env.PERF_DURATION_SECONDS ?? 30),
    pipelining: 1,
    headers: {
      "x-perf-secret": secret,
      Accept: "application/json",
    },
    timeout: 30,
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runNotificationWorkerLoad()
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
