import { requireRole } from "@/lib/auth/guards";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileBarChart } from "lucide-react";

export default async function ReportsPage() {
  await requireRole(["placement_hr", "admin", "super_admin"]);

  const reports = [
    {
      title: "Applications Report",
      description: "Complete candidate application lifecycle.",
      href: "/api/reports/applications",
    },
    {
      title: "Placements Report",
      description: "Placed candidates, CTC and joining status.",
      href: "/api/reports/placements",
    },
    {
      title: "Feedback SLA Report",
      description: "24-hour feedback SLA and 48-hour escalation tracking.",
      href: "/api/reports/feedback-sla",
    },
  ];

  return (
    <div className="p-8">
      <PageHeader 
        title="Reports" 
        description="Download operational placement reports."
      />

      <Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
          {reports.map((report) => (
            <div
              key={report.href}
              className="group flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary dark:bg-indigo-900/50 dark:text-indigo-400">
                    <FileBarChart className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {report.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {report.description}
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <a href={report.href}>
                  <Button className="w-full" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
