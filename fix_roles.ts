import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const roleMapping: Record<string, string> = {
  "superadmin@example.com": "super_admin",
  "admin@example.com": "admin",
  "placementhr@example.com": "placement_hr",
  "clienthr@example.com": "client_hr",
  "student@example.com": "student",
  
  "superadmin@coepd.com": "super_admin",
  "admin@coepd.com": "admin",
  "placementhr@coepd.com": "placement_hr",
  "clienthr@coepd.com": "client_hr",
  "student@coepd.com": "student",
};

async function seedRoles() {
  console.log("Fetching roles...");
  const { data: roles } = await supabase.from("roles").select("*");
  if (!roles) throw new Error("No roles found");
  
  const roleIdMap = roles.reduce((acc, r) => ({ ...acc, [r.name]: r.id }), {} as Record<string, string>);

  console.log("Fetching profiles...");
  const { data: profiles } = await supabase.from("profiles").select("id, email");
  if (!profiles) throw new Error("No profiles found");

  for (const profile of profiles) {
    if (!profile.email) continue;
    
    const roleName = roleMapping[profile.email];
    if (!roleName) continue;
    
    const roleId = roleIdMap[roleName];
    if (!roleId) {
      console.error(`Role ${roleName} not found in DB`);
      continue;
    }
    
    console.log(`Assigning ${roleName} to ${profile.email}...`);
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: profile.id, role_id: roleId }, { onConflict: 'user_id,role_id' });
      
    if (error) {
      console.error(`Failed to assign role to ${profile.email}:`, error.message);
    } else {
      console.log(`✅ Success for ${profile.email}`);
    }
    
    // Also approve their account while we're at it so they don't get 'pending-approval'
    await supabase.from("profiles").update({ account_status: 'approved' }).eq('id', profile.id);
  }
  
  console.log("Done assigning roles!");
}

seedRoles().catch(console.error);
