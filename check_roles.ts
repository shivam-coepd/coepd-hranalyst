import { createClient } from "@supabase/supabase-js";

// Initialize without server-only
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkRoles() {
  const { data: users, error: userError } = await supabaseAdmin
    .from("profiles")
    .select("id, email");
    
  if (userError) {
    console.error("Error fetching users:", userError);
    return;
  }
  
  for (const u of users) {
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select(`
        roles!inner (
          name
        )
      `)
      .eq("user_id", u.id);
      
    console.log(`User ${u.email}:`, JSON.stringify(roles));
  }
}

checkRoles();
