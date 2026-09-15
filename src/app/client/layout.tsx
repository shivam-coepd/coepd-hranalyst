import { requireRole } from "@/lib/auth/guards";
import { Sidebar } from "@/components/navigation/sidebar";
import { Topbar } from "@/components/navigation/topbar";
import { Users, Briefcase, Calendar, BarChart, Building2, CheckCircle2 } from "lucide-react";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["client_hr", "admin", "super_admin"]);

  const navItems = [
    { title: "Dashboard", href: "/client", icon: <BarChart className="h-4 w-4" />, exact: true },
    { title: "Jobs", href: "/client/jobs", icon: <Briefcase className="h-4 w-4" /> },
    { title: "Candidates", href: "/client/submissions", icon: <Users className="h-4 w-4" /> },
    { title: "Interviews", href: "/client/interviews", icon: <Calendar className="h-4 w-4" /> },
    { title: "Placements", href: "/client/placements", icon: <CheckCircle2 className="h-4 w-4" /> },
    { title: "Company", href: "/client/company", icon: <Building2 className="h-4 w-4" /> },
    { title: "Analytics", href: "/client/analytics", icon: <BarChart className="h-4 w-4" /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar title="Client HR" items={navItems} />
      <div className="flex flex-1 flex-col md:pl-64">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
