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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.href} className="group relative flex flex-col justify-between transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/5 text-primary dark:bg-indigo-900/50 dark:text-indigo-400">
                  <FileBarChart className="h-4 w-4" />
                </div>
                {report.title}
              </CardTitle>
              <CardDescription className="pt-2">{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <a href={report.href}>
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
