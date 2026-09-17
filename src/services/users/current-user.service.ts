import { createClient } from "@/lib/supabase/server";
import { ACCOUNT_STATUSES, CurrentUser, UserRole } from "@/types/auth";
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return null;
  }
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      email,
      first_name,
      last_name,
      account_status,
    user_roles!user_id (
        roles (
          name
        )
      )
    `,
    )
    .eq("id", user.id)
    .single();
  if (profileError || !profile) {
    return null;
  }
  const roleRows = profile.user_roles ?? [];
  const roles = roleRows
    .map((item) => item.roles?.name)
    .filter(Boolean) as UserRole[];
  const accountStatus = ACCOUNT_STATUSES.find(
    (status) => status === profile.account_status,
  );
  if (!accountStatus) return null;
  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.first_name,
    lastName: profile.last_name,
    accountStatus,
    roles,
  };
}
