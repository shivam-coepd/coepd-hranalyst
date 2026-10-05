import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabaseAdmin
    .rpc('get_table_schema', { table_name: 'notification_outbox' })
    .catch(() => ({ data: null, error: 'RPC failed' }));
    
  if (error) {
    // If RPC fails, try generic postgres query
    const { data: cols, error: err2 } = await supabaseAdmin.from('notification_outbox').select('*').limit(1);
    console.log(cols ? Object.keys(cols[0]) : err2);
  } else {
    console.log(data);
  }
}
run();
