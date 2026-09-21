import { requireRole } from "@/lib/auth/guards";

import { getAdminAnalytics } from "@/services/analytics/dashboard.service";

import { KpiCard } from "@/components/dashboard/kpi-card";

export default async function PlacementHrAnalyticsPage() {
  await requireRole(["placement_hr", "admin", "super_admin"]);

  const analytics = await getAdminAnalytics();

  const funnel = analytics.funnel as Record<string, number>;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Placement Operations</h1>

        <p className="mt-1 text-sm text-gray-500">
          Placement funnel and SLA health.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Verified" value={funnel.verified_or_beyond ?? 0} />

        <KpiCard label="Submitted" value={funnel.submitted_to_client ?? 0} />

        <KpiCard label="Shortlisted" value={funnel.shortlisted ?? 0} />

        <KpiCard label="Placed" value={funnel.placed ?? 0} />

        <KpiCard
          label="Submission SLA"
          value={`${analytics.submissionSlaPercent}%`}
        />

        <KpiCard label="Feedback Overdue" value={analytics.feedback.overdue} />

        <KpiCard
          label="Client Escalations"
          value={analytics.feedback.escalation}
        />

        <KpiCard label="Operational Alerts" value={analytics.openAlerts} />
      </div>
    </div>
  );
}
