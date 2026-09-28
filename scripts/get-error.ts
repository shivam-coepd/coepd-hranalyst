import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, error } = await supabase
    .from("ai_generation_runs")
    .select("completed_at, status, error_message, model, provider")
    .eq("status", "failed")
    .order("completed_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching run:", error);
    process.exit(1);
  }
  console.log("=== LATEST AI GENERATION ERROR ===");
  console.log(JSON.stringify(data, null, 2));
}
main();
