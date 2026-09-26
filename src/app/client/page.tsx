import { requireRole } from "@/lib/auth/guards";
import { getClientAnalytics } from "@/services/analytics/client-analytics.service";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Users, Briefcase, CheckCircle, Calendar, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ClientDashboardPage() {
  const user = await requireRole(["client_hr", "admin", "super_admin"]);
  const metrics = await getClientAnalytics();

  return (
    <div className="p-8">
      <PageHeader 
        title="Client Dashboard" 
        description={`Welcome back, ${user.firstName || user.email}`}
      />

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Open Jobs"
          value={metrics.metrics.open_jobs || 0}
          icon={Briefcase}
        />
        <StatCard
          title="Submissions"
          value={metrics.metrics.submitted_candidates || 0}
          icon={Users}
        />
        <StatCard
          title="Interviews"
          value={metrics.metrics.interviews || 0}
          icon={Calendar}
        />
        <StatCard
          title="Selected"
          value={metrics.metrics.selected || 0}
          icon={UserCheck}
        />
        <StatCard
          title="Placements"
          value={metrics.metrics.placements || 0}
          icon={CheckCircle}
        />
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.recentSubmissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Recent candidates will appear here.</p>
            ) : (
              <ul className="space-y-4">
                {metrics.recentSubmissions.map((sub: any) => {
                  const job = Array.isArray(sub.jobs) ? sub.jobs[0] : sub.jobs;
                  return (
                    <li key={sub.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                      <span className="font-medium text-sm">{sub.submission_code} - {job?.job_title}</span>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{sub.candidate_count} candidates</span>
                        <span>{new Date(sub.submitted_at).toLocaleDateString()}</span>
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
