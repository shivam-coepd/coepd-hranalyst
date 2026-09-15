import { requireAdmin } from "@/lib/auth/guards";
import { Sidebar } from "@/components/navigation/sidebar";
import { Topbar } from "@/components/navigation/topbar";
import { Users, Building2, Briefcase, BarChart, ShieldAlert, Settings, Clock } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  const navItems = [
    { title: "Dashboard", href: "/admin", icon: <BarChart className="h-4 w-4" />, exact: true },
    { title: "Users", href: "/admin/users", icon: <Users className="h-4 w-4" /> },
    { title: "Pending Approval", href: "/admin/users/pending", icon: <Clock className="h-4 w-4" /> },
    { title: "Companies", href: "/admin/companies", icon: <Building2 className="h-4 w-4" /> },
    { title: "Jobs", href: "/admin/jobs", icon: <Briefcase className="h-4 w-4" /> },
    { title: "Analytics", href: "/admin/analytics", icon: <BarChart className="h-4 w-4" /> },
    { title: "Operations", href: "/admin/operations", icon: <Settings className="h-4 w-4" /> },
    { title: "Security", href: "/admin/security", icon: <ShieldAlert className="h-4 w-4" /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar title="Admin Panel" items={navItems} />
      <div className="flex flex-1 flex-col md:pl-64">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
