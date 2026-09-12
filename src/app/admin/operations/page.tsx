import { requireAdmin } from "@/lib/auth/guards";

import { getOperationalAlerts } from "@/repositories/operational-alerts.repository";

export default async function AdminOperationsPage() {
  await requireAdmin();

  const alerts = await getOperationalAlerts();

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Operational Alerts</h1>

        <p className="mt-1 text-sm text-gray-500">
          SLA breaches and actions requiring administrative follow-up.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">Alert</th>

              <th className="px-4 py-3">Severity</th>

              <th className="px-4 py-3">Entity</th>

              <th className="px-4 py-3">Created</th>

              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.id} className="border-t">
                <td className="px-4 py-3">
                  <p className="font-medium">{alert.title}</p>

                  {alert.description && (
                    <p className="mt-1 text-xs text-gray-500">
                      {alert.description}
                    </p>
                  )}
                </td>

                <td className="px-4 py-3 capitalize">{alert.severity}</td>

                <td className="px-4 py-3">{alert.entity_type}</td>

                <td className="px-4 py-3">
                  {new Date(alert.created_at).toLocaleString("en-IN")}
                </td>

                <td className="px-4 py-3 capitalize">{alert.status}</td>
              </tr>
            ))}

            {alerts.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  No active operational alerts.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
