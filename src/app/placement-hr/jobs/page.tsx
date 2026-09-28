import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getJobs } from "@/repositories/jobs.repository";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase } from "lucide-react";
import { JobFilters } from "@/components/jobs/job-filters";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; roleType?: string }>;
}) {
  const u = await requireRole(["placement_hr", "admin", "super_admin"]);
  const isAdmin = u.roles.some((r) => r === "admin" || r === "super_admin");
  const p = await searchParams;
  const r = await getJobs({
    assignedHrId: !isAdmin ? u.id : undefined,
    search: p.search,
    status: p.status,
    roleType: p.roleType,
  });
  
  return (
    <main className="p-8">
      <PageHeader 
        title="Jobs" 
        description="Manage your assigned job postings."
        actions={
          <Link href="/placement-hr/jobs/new">
            <Button variant="create">
              <Plus className="mr-2 h-4 w-4" />
              Create job
            </Button>
          </Link>
        }
      />
      
      <Card>
        <JobFilters 
          defaultSearch={p.search}
          defaultStatus={p.status}
          defaultRoleType={p.roleType}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
        {r.jobs.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
            No jobs found. Create one to get started.
          </div>
        )}
        {r.jobs.map((j) => {
          let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
          if (j.status === "published") statusVariant = "success";
          if (j.status === "draft") statusVariant = "secondary";
          if (j.status === "pending_checklist") statusVariant = "pending";
          if (j.status === "closed") statusVariant = "destructive";

          return (
            <Link
              key={j.id}
              href={`/placement-hr/jobs/${j.id}`}
              className="group relative flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary dark:bg-indigo-900/50 dark:text-indigo-400">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <Badge variant={statusVariant} className="capitalize">{j.status.replace('_', ' ')}</Badge>
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {j.job_title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                  {j.companies?.name || "Unknown Company"}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs font-medium text-muted-foreground">
                <span>Code: {j.job_code}</span>
                <span>Type: {j.role_type}</span>
              </div>
            </Link>
          );
        })}
        </div>
      </Card>
    </main>
  );
}
