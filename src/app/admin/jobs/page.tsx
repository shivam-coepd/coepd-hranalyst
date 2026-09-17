import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { getJobs } from "@/repositories/jobs.repository";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Hash, Users } from "lucide-react";
import { JobFilters } from "@/components/jobs/job-filters";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; roleType?: string }>;
}) {
  await requireAdmin();
  const p = await searchParams;
  const r = await getJobs({ search: p.search, status: p.status, roleType: p.roleType });
  
  return (
    <main className="p-8">
      <PageHeader 
        title="All Jobs" 
        description="Manage all platform job postings."
        actions={
          <Link href="/admin/jobs/new">
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
            No jobs found.
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
              href={`/admin/jobs/${j.id}`}
              className="group relative flex flex-col justify-between rounded-xl border border-border/50 bg-gradient-to-br from-card to-muted/20 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20 dark:from-slate-950 dark:to-slate-900"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <Badge variant={statusVariant} className="capitalize shadow-sm backdrop-blur-md">
                    {j.status.replace('_', ' ')}
                  </Badge>
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary line-clamp-2">
                  {j.job_title}
                </h3>
                <p className="mt-1.5 text-sm font-medium text-muted-foreground line-clamp-1">
                  {j.companies?.name || "Unknown Company"}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-4 text-xs font-semibold text-muted-foreground border-t pt-4">
                <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                  <Hash className="h-3.5 w-3.5" />
                  {j.job_code}
                </span>
                <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                  <Users className="h-3.5 w-3.5" />
                  {j.role_type}
                </span>
              </div>
            </Link>
          );
        })}
        </div>
      </Card>
    </main>
  );
}

