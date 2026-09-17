import { requireAdmin } from "@/lib/auth/guards";
import { getOperationalAlerts } from "@/repositories/operational-alerts.repository";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminOperationsPage() {
  await requireAdmin();
  const alerts = await getOperationalAlerts();

  return (
    <div className="p-8">
      <PageHeader 
        title="Operational Alerts" 
        description="SLA breaches and actions requiring administrative follow-up."
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50">
              <tr>
                <th className="px-5 py-3 font-medium text-muted-foreground">Alert</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Severity</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Entity</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Created</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {alerts.map((alert) => {
                let severityVariant: "default" | "warning" | "destructive" | "secondary" = "secondary";
                if (alert.severity === "high" || alert.severity === "critical") severityVariant = "destructive";
                if (alert.severity === "medium") severityVariant = "warning";
                if (alert.severity === "low") severityVariant = "default";

                return (
                  <tr key={alert.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{alert.title}</p>
                      {alert.description && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {alert.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={severityVariant} className="capitalize">{alert.severity}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="outline">{alert.entity_type}</Badge>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {new Date(alert.created_at).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={alert.status === 'open' ? 'pending' : 'secondary'} className="capitalize">
                        {alert.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    No active operational alerts. System is healthy.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

