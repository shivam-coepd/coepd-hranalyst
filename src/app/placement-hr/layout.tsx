import { requireRole } from "@/lib/auth/guards";
import { Sidebar } from "@/components/navigation/sidebar";
import { Topbar } from "@/components/navigation/topbar";
import { Briefcase, FileText, CheckSquare, Send, Calendar, BarChart, CheckCircle2 } from "lucide-react";

export default async function PlacementHRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["placement_hr", "admin", "super_admin"]);

  const navItems = [
    { title: "Dashboard", href: "/placement-hr", icon: <BarChart className="h-4 w-4" />, exact: true },
    { title: "Jobs", href: "/placement-hr/jobs", icon: <Briefcase className="h-4 w-4" /> },
    { title: "Verifications", href: "/placement-hr/applications", icon: <CheckSquare className="h-4 w-4" /> },
    { title: "Submissions", href: "/placement-hr/submissions", icon: <Send className="h-4 w-4" /> },
    { title: "Mock Interviews", href: "/placement-hr/mocks", icon: <Calendar className="h-4 w-4" /> },
    { title: "Interviews", href: "/placement-hr/interviews", icon: <Calendar className="h-4 w-4" /> },
    { title: "Offers", href: "/placement-hr/offers", icon: <FileText className="h-4 w-4" /> },
    { title: "Placements", href: "/placement-hr/placements", icon: <CheckCircle2 className="h-4 w-4" /> },
    { title: "Reports", href: "/placement-hr/reports", icon: <BarChart className="h-4 w-4" /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar title="Placement HR" items={navItems} />
      <div className="flex flex-1 flex-col md:pl-64">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
