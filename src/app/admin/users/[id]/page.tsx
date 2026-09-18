import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { getUserById } from "@/repositories/users.repository";
import UserApprovalActions from "./user-approval-actions";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  const roles = user.user_roles?.map((item: { roles: { display_name: any; }; }) => item.roles?.display_name).filter(Boolean) ?? [];

  let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
  if (user.account_status === "approved") statusVariant = "success";
  if (user.account_status === "pending") statusVariant = "pending";
  if (user.account_status === "rejected" || user.account_status === "suspended") statusVariant = "destructive";

  return (
    <div className="p-8">
      <PageHeader
        title={`${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email}
        description={user.first_name ? user.email : "Email user"}
        actions={<UserApprovalActions userId={user.id} status={user.account_status} />}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4 text-sm">
              <Info
                label="Status"
                value={<Badge variant={statusVariant} className="capitalize">{user.account_status}</Badge>}
              />
              <Info
                label="Roles"
                value={
                  <div className="flex flex-wrap gap-1 mt-1">
                    {roles.length > 0 ? (
                      roles.map(r => <Badge key={r} variant="outline" className="font-normal">{r}</Badge>)
                    ) : (
                      <span className="text-muted-foreground text-xs italic">Not assigned</span>
                    )}
                  </div>
                }
              />
              {user.student_profiles && user.student_profiles.enrollment_id && (
                <Info label="Enrollment ID" value={user.student_profiles.enrollment_id} />
              )}
              <Info label="First Name" value={user.first_name ?? "—"} />
              <Info label="Last Name" value={user.last_name ?? "—"} />
              <Info label="Email" value={user.email ?? "—"} />
              <Info label="Phone" value={user.phone ?? "—"} />
              {user.avatar_url && (
                <Info 
                  label="Avatar URL" 
                  value={<a href={user.avatar_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Avatar</a>} 
                />
              )}
              {user.rejection_reason && <Info label="Rejection Reason" value={user.rejection_reason} />}
              <Info label="Approved By" value={user.approved_by ?? "—"} />
              <Info label="Approved At" value={user.approved_at ? new Date(user.approved_at).toLocaleString() : "—"} />
              <Info label="Last Login At" value={user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "—"} />
              <Info
                label="Created At"
                value={user.created_at ? new Date(user.created_at).toLocaleString() : "—"}
              />
              <Info
                label="Updated At"
                value={user.updated_at ? new Date(user.updated_at).toLocaleString() : "—"}
              />
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
