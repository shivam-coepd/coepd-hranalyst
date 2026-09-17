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
          value={metrics.open_jobs || 0}
          icon={Briefcase}
        />
        <StatCard
          title="Submissions"
          value={metrics.submitted_candidates || 0}
          icon={Users}
        />
        <StatCard
          title="Interviews"
          value={metrics.interviews || 0}
          icon={Calendar}
        />
        <StatCard
          title="Selected"
          value={metrics.selected || 0}
          icon={UserCheck}
        />
        <StatCard
          title="Placements"
          value={metrics.placements || 0}
          icon={CheckCircle}
        />
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Recent candidates will appear here.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No upcoming interviews scheduled.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
