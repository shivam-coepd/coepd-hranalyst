import { requireAdmin } from "@/lib/auth/guards";
import { getAdminDashboardMetrics } from "@/services/admin/dashboard.service";

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const metrics = await getAdminDashboardMetrics();

  return (
    <div className="p-8">
      <div>
        <p className="text-sm text-muted-foreground">
          HRAnalyst Placement Wing
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-muted-foreground">
          Welcome, {user.firstName || user.email}
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Pending Users"
          value={String(metrics.pendingUsers)}
        />

        <DashboardCard
          title="Approved Students"
          value={String(metrics.approvedStudents)}
        />

        <DashboardCard
          title="Client Companies"
          value={String(metrics.companies)}
        />

        <DashboardCard
          title="Placement HR"
          value={String(metrics.placementHR)}
        />
      </div>
    </div>
  );
}

function DashboardCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{title}</p>

      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
