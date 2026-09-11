import {
  requireAdmin,
} from "@/lib/auth/guards";

import {
  getAdminAnalytics,
} from "@/services/analytics/dashboard.service";

import {
  KpiCard,
} from "@/components/dashboard/kpi-card";

import {
  FunnelChart,
} from "@/components/dashboard/funnel-chart";

export default async function
AdminAnalyticsPage() {

  await requireAdmin();

  const analytics =
    await getAdminAnalytics();

  const funnel =
    analytics.funnel as
      Record<
        string,
        number
      >;

  const placement =
    analytics.placement as
      Record<
        string,
        number
      >;

  const chartData =
    [
      {
        name:
          "Applications",
        value:
          Number(
            funnel
              .total_applications ??
            0
          ),
      },

      {
        name:
          "Verified",
        value:
          Number(
            funnel
              .verified_or_beyond ??
            0
          ),
      },

      {
        name:
          "Submitted",
        value:
          Number(
            funnel
              .submitted_to_client ??
            0
          ),
      },

      {
        name:
          "Shortlisted",
        value:
          Number(
            funnel
              .shortlisted ??
            0
          ),
      },

      {
        name:
          "Interview",
        value:
          Number(
            funnel
              .interview_stage ??
            0
          ),
      },

      {
        name:
          "Selected",
        value:
          Number(
            funnel
              .selected ??
            0
          ),
      },

      {
        name:
          "Placed",
        value:
          Number(
            funnel
              .placed ??
            0
          ),
      },
    ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">

      <div>
        <h1 className="text-2xl font-bold">
          Placement Analytics
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Operational performance across the full placement funnel.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <KpiCard
          label="Total Applications"
          value={
            funnel
              .total_applications ??
            0
          }
        />

        <KpiCard
          label="Placements"
          value={
            placement
              .total_placements ??
            0
          }
        />

        <KpiCard
          label="JD → Submission SLA"
          value={
            `${analytics.submissionSlaPercent}%`
          }
          helper="Target: within 24 hours"
        />

        <KpiCard
          label="Open Operational Alerts"
          value={
            analytics.openAlerts
          }
        />

        <KpiCard
          label="Feedback Pending"
          value={
            analytics
              .feedback
              .pending
          }
        />

        <KpiCard
          label="Feedback Overdue"
          value={
            analytics
              .feedback
              .overdue
          }
        />

        <KpiCard
          label="48h Escalations"
          value={
            analytics
              .feedback
              .escalation
          }
        />

        <KpiCard
          label="Average CTC"
          value={
            `₹${Number(
              placement
                .average_ctc_inr ??
              0
            ).toLocaleString(
              "en-IN"
            )}`
          }
        />

      </div>

      <div className="rounded-xl border bg-white p-6">

        <h2 className="text-lg font-semibold">
          Placement Funnel
        </h2>

        <div className="mt-6">
          <FunnelChart
            data={
              chartData
            }
          />
        </div>

      </div>

    </div>
  );
}