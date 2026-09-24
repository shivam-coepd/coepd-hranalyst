import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getStudentApplicationList } from "@/repositories/students.repository";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Building2, Briefcase } from "lucide-react";

export default async function Page() {
  await requireRole("student");
  const apps = await getStudentApplicationList();

  return (
    <main className="p-8">
      <PageHeader
        title="My Applications"
        description="Track the status of your job applications."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {apps.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
            No applications yet.
          </div>
        )}
        {apps.map((a) => {
          const j = Array.isArray(a.jobs) ? a.jobs[0] : a.jobs;
          const c = j?.companies;

          let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
          if (a.status === "verification_pending" || a.status === "under_verification") statusVariant = "pending";
          if (a.status === "verified") statusVariant = "success";
          if (a.status === "rejected") statusVariant = "destructive";

          return (
            <div key={a.id} className="flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <Badge variant={statusVariant} className="capitalize">{a.status.replace('_', ' ')}</Badge>
                </div>

                <Link href={`/student/jobs/${j?.id}`} className="block mt-4">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground hover:text-primary transition-colors">
                    {j?.job_title ?? "Job"}
                  </h3>
                </Link>

                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span>{j?.companies?.name ?? "Company"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 shrink-0" />
                    <span>Code: {j?.job_code}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-muted-foreground">Match Score</div>
                    <div className="font-medium text-primary">
                      {a.match_score == null ? "Pending" : `${a.match_score}%`}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">ATS Score</div>
                    <div className="font-medium text-secondary-foreground">
                      {a.ats_score == null ? "Pending" : `${a.ats_score}%`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Scoring: {a.score_status}
                  </span>
                  <Link href={`/student/applications/${a.id}`}>
                    <Button variant="ghost" size="sm">View details</Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
