import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import CreateUserForm from "./create-user-form";

export default async function CreateUserPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: companies, error } = await supabase
    .from("companies")
    .select("id,name")
    .eq("verification_status", "verified")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("name");

  if (error) throw new Error(error.message);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">Create user</h1>
      <p className="mt-1 text-muted-foreground">
        Create and invite an approved-role candidate for administrator review.
      </p>
      <CreateUserForm companies={companies ?? []} />
    </div>
  );
}
