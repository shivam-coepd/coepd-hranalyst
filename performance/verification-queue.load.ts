import autocannon from "autocannon";

const baseUrl = process.env.PERF_TEST_BASE_URL ?? "http://localhost:3000";

const secret = process.env.PERF_TEST_SECRET;

if (!secret) {
  throw new Error("PERF_TEST_SECRET required");
}

export async function runVerificationQueueLoad() {
  return autocannon({
    url: `${baseUrl}/api/perf/verification-queue`,

    connections: 100,

    duration: 30,

    pipelining: 1,

    headers: {
      "x-perf-secret": secret,
    },

    timeout: 10,
  });
}
