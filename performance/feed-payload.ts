const url = process.env.PERF_TEST_BASE_URL ?? "http://localhost:3000";

const secret = process.env.PERF_TEST_SECRET;

if (!secret) {
  throw new Error("PERF_TEST_SECRET required");
}

async function main() {
  const response = await fetch(`${url}/api/perf/student-feed?limit=25`, {
    headers: {
      "x-perf-secret": secret!,
    },
  });

  const text = await response.text();

  const bytes = Buffer.byteLength(text, "utf8");

  console.log({
    bytes,

    kilobytes: Number((bytes / 1024).toFixed(2)),
  });

  if (bytes > 250 * 1024) {
    throw new Error("Job feed payload exceeds recommended 250KB limit");
  }
}

main();
export {};
