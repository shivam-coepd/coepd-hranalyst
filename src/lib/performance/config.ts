import "server-only";

export function assertPerformanceEnabled() {
  if (process.env.PERF_TEST_ENABLED !== "true") {
    throw new Error("Performance endpoints are disabled");
  }

  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_PRODUCTION_PERF_TEST !== "true"
  ) {
    throw new Error("Performance endpoints cannot run in production");
  }
}

export function getPerformanceSecret() {
  const secret = process.env.PERF_TEST_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("PERF_TEST_SECRET must be at least 32 characters");
  }

  return secret;
}
