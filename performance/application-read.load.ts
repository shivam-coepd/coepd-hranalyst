import fs from "node:fs/promises";

import path from "node:path";

import autocannon from "autocannon";

import type { PerfSeedManifest } from "./types";

const baseUrl = process.env.PERF_TEST_BASE_URL ?? "http://localhost:3000";

const secret = process.env.PERF_TEST_SECRET;

if (!secret) {
  throw new Error("PERF_TEST_SECRET required");
}

export async function runApplicationReadLoad() {
  const manifest = JSON.parse(
    await fs.readFile(
      path.join(
        process.cwd(),
        "performance",
        "generated",
        "seed-manifest.json",
      ),
      "utf8",
    ),
  ) as PerfSeedManifest;

  if (manifest.applicationIds.length === 0) {
    throw new Error("No seeded applications available");
  }

  const applicationId = manifest.applicationIds[0];

  return autocannon({
    url: `${baseUrl}/api/perf/application/${applicationId}`,

    connections: 250,

    duration: 45,

    pipelining: 1,

    headers: {
      "x-perf-secret": secret,
    },

    timeout: 10,
  });
}
