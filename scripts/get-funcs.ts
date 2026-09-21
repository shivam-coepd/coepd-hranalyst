import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import { execSync } from "child_process";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres';
  // Use psql if available to dump function definitions
  try {
    const out = execSync(`psql "${dbUrl}" -c "SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname IN ('begin_application_scoring', 'complete_application_scoring', 'fail_application_scoring');"`, { encoding: 'utf-8' });
    console.log(out);
  } catch(e: any) {
    console.error("psql failed:", e.message);
  }
}
main();
