import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRole) {
  throw new Error("Supabase admin environment configuration missing");
}

export const supabaseAdmin = createClient<Database>(url, serviceRole, {
  auth: {
    autoRefreshToken: false,

    persistSession: false,

    detectSessionInUrl: false,
  },
});
