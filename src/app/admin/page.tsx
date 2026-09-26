import { requireAdmin } from "@/lib/auth/guards";
import { getAdminDashboardMetrics } from "@/services/admin/dashboard.service";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Users, Building2, UserCheck, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const metrics = await getAdminDashboardMetrics();

  return (
    <div className="p-8">
      <PageHeader 
        title="Admin Dashboard" 
        description={`Welcome back, ${user.firstName || user.email}`} 
      />

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Users"
          value={metrics.pendingUsers}
          icon={Users}
          description="Awaiting approval"
        />
        <StatCard
          title="Approved Students"
          value={metrics.approvedStudents}
          icon={UserCheck}
          description="Active student accounts"
        />
        <StatCard
          title="Client Companies"
          value={metrics.companies}
          icon={Building2}
          description="Partner organizations"
        />
        <StatCard
          title="Placement HR"
          value={metrics.placementHR}
          icon={Briefcase}
          description="Active HR personnel"
        />
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.recentJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Activity feed will appear here.</p>
            ) : (
              <ul className="space-y-4">
                {metrics.recentJobs.map((job: any) => {
                  const company = Array.isArray(job.companies) ? job.companies[0] : job.companies;
                  return (
                    <li key={job.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                      <span className="font-medium text-sm">New job published: {job.job_title}</span>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{company?.name}</span>
                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">All systems operational.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

