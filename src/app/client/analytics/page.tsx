import { getClientAnalytics } from "@/services/analytics/client-analytics.service";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Briefcase, Users, FileCheck, CalendarClock, UserCheck, Award } from "lucide-react";

export default async function ClientAnalyticsPage() {
  const data = await getClientAnalytics();

  const metrics = [
    { label: "Open Jobs", value: data.metrics.open_jobs, icon: Briefcase },
    { label: "Candidates Submitted", value: data.metrics.submitted_candidates, icon: Users },
    { label: "Shortlisted", value: data.metrics.shortlisted, icon: FileCheck },
    { label: "Active Interviews", value: data.metrics.interviews, icon: CalendarClock },
    { label: "Selected", value: data.metrics.selected, icon: UserCheck },
    { label: "Placements", value: data.metrics.placements, icon: Award },
  ];

  return (
    <div className="p-8">
      <PageHeader 
        title="Recruitment Analytics" 
        description="Candidate pipeline for your organization."
      />

      <Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="group flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary dark:bg-indigo-900/50 dark:text-indigo-400">
                    <metric.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-4 text-sm font-medium tracking-tight text-muted-foreground transition-colors">
                  {metric.label}
                </h3>
              </div>
              
              <div className="mt-2 pt-2 border-t">
                <p className="text-3xl font-bold text-foreground">
                  {metric.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
