import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // use anon key
const adminClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  // Login as placement_hr
  const { data: authData, error: authErr } = await adminClient.auth.signInWithPassword({
    email: "placementhr@coepd.com",
    password: process.env.UAT_USER_PASSWORD || "46809da568ce36f33e51cf3372ba8448cd2e4b49c33bfc8ffb37250d16ac799d"
  });
  
  if (authErr) {
    console.log("Login failed", authErr);
    
    // Instead of logging in with password, we can generate a temporary JWT using Admin API!
    // But let's see if we can just test RLS directly
  }
}
run();
