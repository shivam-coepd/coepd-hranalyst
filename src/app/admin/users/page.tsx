import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { listUsers } from "@/services/users/users.service";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UserFilters } from "./user-filters";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    search?: string;
    role?: string;
    page?: string;
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const result = await listUsers({
    status: params.status,
    search: params.search,
    role: params.role,
    page,
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Users"
        description="Manage all HRAnalyst Placement Platform accounts."
        actions={
          <Link href="/admin/users/create">
            <Button variant="create">
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </Link>
        }
      />

      <Card>
        <UserFilters
          defaultSearch={params.search}
          defaultStatus={params.status}
          defaultRole={params.role}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">User</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Created</th>
                <th className="px-5 py-3 text-right font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {result.users.map((user) => {
                let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
                if (user.account_status === "approved") statusVariant = "success";
                if (user.account_status === "pending") statusVariant = "pending";
                if (user.account_status === "rejected" || user.account_status === "suspended") statusVariant = "destructive";

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-medium">
                          {user.first_name?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map(r => (
                          <Badge key={r.name} variant="outline" className="font-normal">
                            {r.display_name}
                          </Badge>
                        ))}
                        {user.roles.length === 0 && (
                          <span className="text-muted-foreground text-xs italic">Unassigned</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <Badge variant={statusVariant} className="capitalize">
                        {user.account_status}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {result.users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
