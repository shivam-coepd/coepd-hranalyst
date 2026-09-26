const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_query: "SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'student_decide_offer';"
  });

  if (error) {
    console.error("Error calling execute_sql directly. Let's try another approach.", error);
  } else {
    console.log(data);
  }
}

run();
