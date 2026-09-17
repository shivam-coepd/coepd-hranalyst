import { requireRole } from "@/lib/auth/guards";
import { Sidebar } from "@/components/navigation/sidebar";
import { Topbar } from "@/components/navigation/topbar";
import { Briefcase, FileText, Send, Calendar, Award, UserCircle, CheckCircle2, BarChart } from "lucide-react";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["student", "admin", "super_admin"]);

  const navItems = [
    { title: "Dashboard", href: "/student", icon: <BarChart className="h-4 w-4" />, exact: true },
    { title: "Jobs", href: "/student/jobs", icon: <Briefcase className="h-4 w-4" /> },
    { title: "Applications", href: "/student/applications", icon: <Send className="h-4 w-4" /> },
    { title: "Mocks", href: "/student/mocks", icon: <Calendar className="h-4 w-4" /> },
    { title: "Interviews", href: "/student/interviews", icon: <Calendar className="h-4 w-4" /> },
    { title: "Offers", href: "/student/offers", icon: <Award className="h-4 w-4" /> },
    { title: "Placements", href: "/student/placements", icon: <CheckCircle2 className="h-4 w-4" /> },
    { title: "My CVs", href: "/student/cv", icon: <FileText className="h-4 w-4" /> },
    { title: "Profile", href: "/student/profile", icon: <UserCircle className="h-4 w-4" /> },
  ];

  return (
    <div className="flex min-h-screen bg-muted dark:bg-primary">
      <Sidebar title="Student Portal" items={navItems} />
      <div className="flex flex-1 flex-col md:pl-64">
        <Topbar user={user} navTitle="Student Portal" navItems={navItems} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
