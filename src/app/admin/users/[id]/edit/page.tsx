import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";
import EditUserForm from "@/components/users/edit-user-form";
import { updateUserAction } from "./actions";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("first_name, last_name, phone, email")
    .eq("id", id)
    .single();

  if (error || !profile) {
    notFound();
  }

  const defaults = {
    firstName: profile.first_name || "",
    lastName: profile.last_name || "",
    phone: profile.phone || "",
  };

  const actionWithId = updateUserAction.bind(null, id);

  return (
    <div className="mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit user</h1>
        <p className="text-slate-500 mt-2">
          Update the profile details for {profile.email}.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <EditUserForm action={actionWithId} defaults={defaults} />
      </div>
    </div>
  );
}
