import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { getUatRuns } from "@/repositories/uat.repository";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function UatRunsPage() {
  await requireAdmin();
  const runs = await getUatRuns();
  
  return (
    <div className="p-8">
      <PageHeader 
        title="UAT Runs" 
        description="Final release validation across all HRAnalyst placement workflows."
      />

      <Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
          {runs.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
              No UAT runs found.
            </div>
          )}
          {runs.map((run) => {
            let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
            if (run.status === "passed") statusVariant = "success";
            if (run.status === "failed") statusVariant = "destructive";
            if (run.status === "running") statusVariant = "pending";

            return (
              <Link
                key={run.id}
                href={`/admin/uat/${run.id}`}
                className="group flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary dark:bg-indigo-900/50 dark:text-indigo-400">
                      <span className="font-semibold text-lg">U</span>
                    </div>
                    <Badge variant={statusVariant} className="capitalize">{run.status}</Badge>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground transition-colors">
                    {run.run_code}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Release: {run.release_version}
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span className="text-emerald-600 dark:text-emerald-400">Passed: {run.passed_tests}/{run.total_tests}</span>
                  <span className="text-rose-600 dark:text-rose-400">Failed: {run.failed_tests}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
