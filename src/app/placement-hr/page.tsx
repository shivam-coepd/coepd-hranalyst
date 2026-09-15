import { requireRole } from "@/lib/auth/guards";
import { getAdminDashboardMetrics } from "@/services/admin/dashboard.service";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Users, Building2, UserCheck, Briefcase } from "lucide-react";

export default async function PlacementHRDashboardPage() {
  const user = await requireRole(["placement_hr", "admin", "super_admin"]);
  const metrics = await getAdminDashboardMetrics();

  return (
    <div className="p-8">
      <PageHeader 
        title="Placement HR Dashboard" 
        description={`Welcome back, ${user.firstName || user.email}`} 
      />

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Student Approvals"
          value={metrics.pendingUsers}
          icon={Users}
        />
        <StatCard
          title="Active Students"
          value={metrics.approvedStudents}
          icon={UserCheck}
        />
        <StatCard
          title="Client Companies"
          value={metrics.companies}
          icon={Building2}
        />
        <StatCard
          title="Active Jobs"
          value="24" // Placeholder until job metrics are added
          icon={Briefcase}
        />
      </div>
    </div>
  );
}
