import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { getUserById } from "@/repositories/users.repository";
import UserApprovalActions from "./user-approval-actions";
export default async function UserDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  await requireAdmin();
  const { id } = await params;
  let user;
  try {
    user = await getUserById(id);
  } catch {
    notFound();
  }
  if (!user) {
    notFound();
  }
  const roles =
    user.user_roles
      ?.map((item) => item.roles?.display_name)
      .filter((role): role is string => Boolean(role)) ?? [];
  return (
    <div className="p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {user.first_name} {user.last_name}
          </h1>

          <p className="mt-1 text-muted-foreground">{user.email}</p>
        </div>

        <UserApprovalActions userId={user.id} status={user.account_status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold">Account</h2>

          <dl className="mt-5 space-y-4 text-sm">
            <Info label="Status" value={user.account_status} />

            <Info label="Role" value={roles.join(", ") || "Not assigned"} />

            <Info label="Phone" value={user.phone ?? "—"} />

            <Info
              label="Created"
              value={new Date(user.created_at).toLocaleString()}
            />
          </dl>
        </section>
      </div>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>

      <dd className="mt-1 font-medium capitalize">{value}</dd>
    </div>
  );
}
