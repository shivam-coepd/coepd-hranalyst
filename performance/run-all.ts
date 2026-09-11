import fs from "node:fs/promises";

import path from "node:path";

import { runJobFeedLoad } from "./job-feed.load";

import { runApplicationReadLoad } from "./application-read.load";

import { runVerificationQueueLoad } from "./verification-queue.load";

import { normalizeAutocannonResult, type PerfCaseResult } from "./report";

const p95Limit = Number(process.env.PERF_FEED_P95_MS ?? 1500);

const p99Limit = Number(process.env.PERF_FEED_P99_MS ?? 1900);

const maxErrorRate = Number(process.env.PERF_ERROR_RATE_PERCENT ?? 1);

async function saveReport(cases: PerfCaseResult[]) {
  const directory = path.join(process.cwd(), "performance", "generated");

  await fs.mkdir(directory, {
    recursive: true,
  });

  const passed = cases.every((item) => item.passed);

  const json = {
    generatedAt: new Date().toISOString(),

    overallPassed: passed,

    sourceRequirements: {
      concurrentStudents: 1000,

      jobFeedMaxMilliseconds: 2000,
    },

    engineeringThresholds: {
      p95Milliseconds: p95Limit,

      p99Milliseconds: p99Limit,

      maxErrorRatePercent: maxErrorRate,
    },

    cases,
  };

  await fs.writeFile(
    path.join(directory, "performance-report.json"),
    JSON.stringify(json, null, 2),
    "utf8",
  );

  const markdown = `# HRAnalyst Performance Test Report

Generated: ${json.generatedAt}

Overall: ${passed ? "PASS" : "FAIL"}

## Source Requirements

- Concurrent students: 1,000
- Job feed response: under 2,000 ms

## Engineering Thresholds

- P95: ${p95Limit} ms
- P99: ${p99Limit} ms
- Maximum error rate: ${maxErrorRate}%

## Results

| Test | Requests | Req/s | Avg | P95 | P99 | Error Rate | Result |
|---|---:|---:|---:|---:|---:|---:|---|
${cases
  .map(
    (item) =>
      `| ${item.name} | ${item.totalRequests} | ${item.requestsPerSecond} | ${item.latencyAverage}ms | ${item.latencyP95}ms | ${item.latencyP99}ms | ${item.errorRatePercent}% | ${item.passed ? "PASS" : "FAIL"} |`,
  )
  .join("\n")}

## Failures

${
  cases
    .flatMap((item) =>
      item.failures.map((failure) => `- ${item.name}: ${failure}`),
    )
    .join("\n") || "- None"
}
`;

  await fs.writeFile(
    path.join(directory, "performance-report.md"),
    markdown,
    "utf8",
  );

  return passed;
}

async function main() {
  console.log("Running job-feed load test...");

  const feed = await runJobFeedLoad();

  console.log("Running application-read load test...");

  const applications = await runApplicationReadLoad();

  console.log("Running verification-queue load test...");

  const verification = await runVerificationQueueLoad();

  const results: PerfCaseResult[] = [
    normalizeAutocannonResult({
      name: "Student Job Feed",

      result: feed,

      p95LimitMs: p95Limit,

      p99LimitMs: p99Limit,

      maxErrorRatePercent: maxErrorRate,
    }),

    normalizeAutocannonResult({
      name: "Application Detail",

      result: applications,

      p95LimitMs: 1200,

      p99LimitMs: 1800,

      maxErrorRatePercent: maxErrorRate,
    }),

    normalizeAutocannonResult({
      name: "Verification Queue",

      result: verification,

      p95LimitMs: 1200,

      p99LimitMs: 1800,

      maxErrorRatePercent: maxErrorRate,
    }),
  ];

  const passed = await saveReport(results);

  console.table(
    results.map((item) => ({
      Test: item.name,

      P95: item.latencyP95,

      P99: item.latencyP99,

      ErrorRate: item.errorRatePercent,

      Result: item.passed ? "PASS" : "FAIL",
    })),
  );

  if (!passed) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);

  process.exit(1);
});
