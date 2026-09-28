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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
          {alerts.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
              No active operational alerts. System is healthy.
            </div>
          )}
          {alerts.map((alert) => {
            let severityVariant: "default" | "warning" | "destructive" | "secondary" = "secondary";
            if (alert.severity === "high" || alert.severity === "critical") severityVariant = "destructive";
            if (alert.severity === "medium") severityVariant = "warning";
            if (alert.severity === "low") severityVariant = "default";

            return (
              <div
                key={alert.id}
                className="group flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary dark:bg-indigo-900/50 dark:text-indigo-400">
                      <span className="font-semibold text-lg">!</span>
                    </div>
                    <Badge variant={severityVariant} className="capitalize">{alert.severity}</Badge>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground transition-colors">
                    {alert.title}
                  </h3>
                  {alert.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {alert.description}
                    </p>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <Badge variant="outline">{alert.entity_type}</Badge>
                  <span>{new Date(alert.created_at).toLocaleString("en-IN")}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

