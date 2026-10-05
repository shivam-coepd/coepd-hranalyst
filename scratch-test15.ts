import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: notifications, error } = await supabaseAdmin
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);
    
  console.log("Recent notifications:", notifications, error);

  const { data: q, error: e2 } = await supabaseAdmin.from("notification_queue").select("*").limit(10);
  console.log("Notification queue:", q, e2);
}

run();
