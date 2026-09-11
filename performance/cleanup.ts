import fs from "node:fs/promises";

import path from "node:path";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "../src/types/database";

import type { PerfSeedManifest } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  throw new Error("Supabase configuration missing");
}

if (process.env.PERF_TEST_ENABLED !== "true") {
  throw new Error("PERF_TEST_ENABLED=true required for cleanup");
}

const supabase = createClient<Database>(url, serviceRole, {
  auth: {
    persistSession: false,
  },
});

async function main() {
  const manifestPath = path.join(
    process.cwd(),
    "performance",
    "generated",
    "seed-manifest.json",
  );

  const manifest = JSON.parse(
    await fs.readFile(manifestPath, "utf8"),
  ) as PerfSeedManifest;

  console.log("Removing performance applications...");

  for (const id of manifest.applicationIds) {
    await supabase.from("applications").delete().eq("id", id);
  }

  console.log("Removing performance jobs...");

  for (const id of manifest.jobIds) {
    await supabase.from("jobs").delete().eq("id", id);
  }

  console.log("Removing performance students...");

  for (const userId of manifest.studentUserIds) {
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.warn(`Unable to delete ${userId}: ${error.message}`);
    }
  }

  console.log("Removing performance companies...");

  for (const id of manifest.companyIds) {
    await supabase.from("companies").delete().eq("id", id);
  }

  await fs.rm(manifestPath, {
    force: true,
  });

  console.log("Performance data cleanup complete");
}

main().catch((error) => {
  console.error(error);

  process.exit(1);
});
