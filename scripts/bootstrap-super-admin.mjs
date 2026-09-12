import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD;

if (!url || !key || !email || !password || password.length < 12) {
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BOOTSTRAP_SUPER_ADMIN_EMAIL and a BOOTSTRAP_SUPER_ADMIN_PASSWORD of at least 12 characters.",
  );
}

const admin = createClient(url, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

const { data: created, error: createError } = await admin.auth.admin.createUser(
  {
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: "Super", last_name: "Admin" },
  },
);

if (createError || !created.user) {
  throw new Error(
    createError?.message ?? "Unable to create bootstrap Super Admin",
  );
}

const userId = created.user.id;

try {
  const { data: role, error: roleError } = await admin
    .from("roles")
    .select("id")
    .eq("name", "super_admin")
    .single();
  if (roleError || !role) throw new Error("super_admin role not found");

  const { error: assignmentError } = await admin.from("user_roles").insert({
    user_id: userId,
    role_id: role.id,
    assigned_by: userId,
  });
  if (assignmentError) throw assignmentError;

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      account_status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: userId,
    })
    .eq("id", userId);
  if (profileError) throw profileError;

  console.log(`Super Admin created and approved: ${email}`);
} catch (error) {
  await admin.auth.admin.deleteUser(userId);
  throw error;
}
