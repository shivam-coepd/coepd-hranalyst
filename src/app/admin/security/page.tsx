import { requireAdmin } from "@/lib/auth/guards";
import { getSecurityOverview } from "@/repositories/security.repository";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShieldAlert, Users, UserX, BellRing, Activity } from "lucide-react";

export default async function AdminSecurityPage() {
  await requireAdmin();
  const data = await getSecurityOverview();

  return (
    <div className="p-8">
      <PageHeader 
        title="Security & System Health" 
        description="Production security and operational status."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Failed Notifications"
          value={data.failedNotifications}
          icon={BellRing}
        />
        <StatCard 
          title="Suspended Accounts" 
          value={data.suspendedUsers}
          icon={UserX} 
        />
        <StatCard 
          title="Operational Alerts" 
          value={data.openAlerts}
          icon={ShieldAlert}
        />
        <StatCard 
          title="Rejected Accounts" 
          value={data.rejectedUsers}
          icon={Users}
        />
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <span className="font-medium">Health</span>
                <code className="rounded bg-slate-100 px-2 py-1 text-slate-800 dark:bg-slate-800 dark:text-slate-300">/api/health</code>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <span className="font-medium">Readiness</span>
                <code className="rounded bg-slate-100 px-2 py-1 text-slate-800 dark:bg-slate-800 dark:text-slate-300">/api/readiness</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
