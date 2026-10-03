import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: mocks, error } = await supabase
    .from("mock_interviews")
    .select("*")
    .eq("id", "0c94dba0-e2c2-4001-824d-148e2d9da9f9");
    
  console.log("Mocks:", mocks, error);
}

run();
