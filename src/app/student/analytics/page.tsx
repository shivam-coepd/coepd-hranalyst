import { getStudentAnalytics } from "@/services/analytics/student-analytics.service";

import { KpiCard } from "@/components/dashboard/kpi-card";

export default async function StudentAnalyticsPage() {
  const analytics = await getStudentAnalytics();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Placement Journey</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Applications" value={analytics.applications} />

        <KpiCard label="Client Interviews" value={analytics.interviews} />

        <KpiCard label="Offers" value={analytics.offers} />

        <KpiCard label="Placements" value={analytics.placements} />
      </div>
    </div>
  );
}
