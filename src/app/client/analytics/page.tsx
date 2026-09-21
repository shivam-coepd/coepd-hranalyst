import { getClientAnalytics } from "@/services/analytics/client-analytics.service";

import { KpiCard } from "@/components/dashboard/kpi-card";

export default async function ClientAnalyticsPage() {
  const data = await getClientAnalytics();

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Recruitment Analytics</h1>

        <p className="mt-1 text-sm text-gray-500">
          Candidate pipeline for your organization.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Open Jobs" value={data.open_jobs} />

        <KpiCard
          label="Candidates Submitted"
          value={data.submitted_candidates}
        />

        <KpiCard label="Shortlisted" value={data.shortlisted} />

        <KpiCard label="Active Interviews" value={data.interviews} />

        <KpiCard label="Selected" value={data.selected} />

        <KpiCard label="Placements" value={data.placements} />
      </div>
    </div>
  );
}
