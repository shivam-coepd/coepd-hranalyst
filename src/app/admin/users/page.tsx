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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
          {result.users.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
              No users found matching your criteria.
            </div>
          )}
          {result.users.map((user) => {
            let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
            if (user.account_status === "approved") statusVariant = "success";
            if (user.account_status === "pending") statusVariant = "pending";
            if (user.account_status === "rejected" || user.account_status === "suspended") statusVariant = "destructive";

            return (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="group flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary dark:bg-indigo-900/50 dark:text-indigo-400 font-semibold text-lg">
                      {user.first_name?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <Badge variant={statusVariant} className="capitalize">{user.account_status}</Badge>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                    {user.email}
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t flex flex-wrap gap-1">
                  {user.roles.map(r => (
                    <Badge key={r.name} variant="outline" className="font-normal text-xs">
                      {r.display_name}
                    </Badge>
                  ))}
                  {user.roles.length === 0 && (
                    <span className="text-muted-foreground text-xs italic">Unassigned</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
