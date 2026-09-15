import { requireAdmin } from "@/lib/auth/guards";
import { getAdminAnalytics } from "@/services/analytics/dashboard.service";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { FileText, CheckCircle2, Clock, AlertTriangle, TrendingUp } from "lucide-react";

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const analytics = await getAdminAnalytics();
  const funnel = analytics.funnel as Record<string, number>;
  const placement = analytics.placement as Record<string, number>;

  const chartData = [
    { name: "Applications", value: Number(funnel.total_applications ?? 0) },
    { name: "Verified", value: Number(funnel.verified_or_beyond ?? 0) },
    { name: "Submitted", value: Number(funnel.submitted_to_client ?? 0) },
    { name: "Shortlisted", value: Number(funnel.shortlisted ?? 0) },
    { name: "Interview", value: Number(funnel.interview_stage ?? 0) },
    { name: "Selected", value: Number(funnel.selected ?? 0) },
    { name: "Placed", value: Number(funnel.placed ?? 0) },
  ];

  return (
    <div className="p-8">
      <PageHeader 
        title="Placement Analytics" 
        description="Operational performance across the full placement funnel."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Applications"
          value={funnel.total_applications ?? 0}
          icon={FileText}
        />
        <StatCard 
          title="Total Placements" 
          value={placement.total_placements ?? 0}
          icon={CheckCircle2}
          trend={{ value: 12, label: "from last month" }}
        />
        <StatCard
          title="JD → Submission SLA"
          value={`${analytics.submissionSlaPercent}%`}
          icon={Clock}
          description="Target: within 24 hours"
        />
        <StatCard 
          title="Average CTC"
          value={`₹${Number(placement.average_ctc_inr ?? 0).toLocaleString("en-IN")}`}
          icon={TrendingUp}
        />
      </div>

      <h2 className="mt-8 mb-4 text-xl font-bold tracking-tight">Operations & Feedback</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Feedback Pending" 
          value={analytics.feedback.pending}
          icon={Clock}
        />
        <StatCard 
          title="Feedback Overdue" 
          value={analytics.feedback.overdue}
          icon={AlertTriangle}
        />
        <StatCard
          title="48h Escalations"
          value={analytics.feedback.escalation}
          icon={AlertTriangle}
        />
        <StatCard 
          title="Open Alerts" 
          value={analytics.openAlerts}
          icon={AlertTriangle}
        />
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Placement Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart data={chartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
