import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: outbox, error } = await supabaseAdmin
    .from("notification_outbox")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);
    
  console.log("Notification outbox:", outbox, error);
}

run();
