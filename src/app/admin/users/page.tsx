import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { listUsers } from "@/services/users/users.service";
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const result = await listUsers({
    status: params.status,
    search: params.search,
    page,
  });
  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>

          <p className="mt-1 text-muted-foreground">
            Manage all HRAnalyst Placement Platform accounts.
          </p>
        </div>

        <Link
          href="/admin/users/create"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
        >
          Create User
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-sm">User</th>

              <th className="px-5 py-3 text-left text-sm">Role</th>

              <th className="px-5 py-3 text-left text-sm">Status</th>

              <th className="px-5 py-3 text-left text-sm">Created</th>

              <th className="px-5 py-3" />
            </tr>
          </thead>

          <tbody>
            {result.users.map((user) => {
              const roles =
                user.roles.map((role) => role.display_name).join(", ") ||
                "No Role";
              return (
                <tr key={user.id} className="border-t">
                  <td className="px-5 py-4">
                    <p className="font-medium">
                      {user.first_name} {user.last_name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm">{roles}</td>

                  <td className="px-5 py-4">
                    <StatusBadge status={user.account_status} />
                  </td>

                  <td className="px-5 py-4 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-sm font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full border px-2.5 py-1 text-xs font-medium capitalize">
      {status}
    </span>
  );
}
