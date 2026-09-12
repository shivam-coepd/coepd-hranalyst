import { requireAdmin } from "@/lib/auth/guards";

import { getSecurityOverview } from "@/repositories/security.repository";

import { KpiCard } from "@/components/dashboard/kpi-card";

export default async function AdminSecurityPage() {
  await requireAdmin();

  const data = await getSecurityOverview();

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Security & System Health</h1>

        <p className="mt-1 text-sm text-gray-500">
          Production security and operational status.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Failed Notifications"
          value={data.failedNotifications}
        />

        <KpiCard label="Suspended Accounts" value={data.suspendedUsers} />

        <KpiCard label="Operational Alerts" value={data.openAlerts} />

        <KpiCard label="Rejected Accounts" value={data.rejectedUsers} />
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="font-semibold">System Endpoints</h2>

        <div className="mt-4 space-y-2 text-sm">
          <p>
            Health: <code>/api/health</code>
          </p>

          <p>
            Readiness: <code>/api/readiness</code>
          </p>
        </div>
      </div>
    </div>
  );
}
