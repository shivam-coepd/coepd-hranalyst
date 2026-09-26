import { requireRole } from "@/lib/auth/guards";
import { getAdminDashboardMetrics } from "@/services/admin/dashboard.service";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Users, Building2, UserCheck, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PlacementHRDashboardPage() {
  const user = await requireRole(["placement_hr", "admin", "super_admin"]);
  const metrics = await getAdminDashboardMetrics();

  return (
    <div className="p-8">
      <PageHeader 
        title="Placement HR Dashboard" 
        description={`Welcome back, ${user.firstName || user.email}`} 
      />

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Student Approvals"
          value={metrics.pendingUsers}
          icon={Users}
        />
        <StatCard
          title="Active Students"
          value={metrics.approvedStudents}
          icon={UserCheck}
        />
        <StatCard
          title="Client Companies"
          value={metrics.companies}
          icon={Building2}
        />
        <StatCard
          title="Active Jobs"
          value={metrics.activeJobs}
          icon={Briefcase}
        />
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Job Postings</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.recentJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Recent jobs will appear here.</p>
            ) : (
              <ul className="space-y-4">
                {metrics.recentJobs.map((job: any) => {
                  const company = Array.isArray(job.companies) ? job.companies[0] : job.companies;
                  return (
                    <li key={job.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                      <span className="font-medium">{job.job_title} <span className="text-muted-foreground text-xs font-normal">({job.job_code})</span></span>
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
            <CardTitle>Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.upcomingInterviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming interviews scheduled.</p>
            ) : (
              <ul className="space-y-4">
                {metrics.upcomingInterviews.map((int: any) => {
                  const app = Array.isArray(int.applications) ? int.applications[0] : int.applications;
                  const job = app && (Array.isArray(app.jobs) ? app.jobs[0] : app.jobs);
                  return (
                    <li key={int.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                      <span className="font-medium">{job?.job_title} - Round {int.round_number}</span>
                      <div className="text-xs text-muted-foreground">
                        {new Date(int.scheduled_at).toLocaleString()}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
