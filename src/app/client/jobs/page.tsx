import Link from "next/link";
import { requireActiveClientHr } from "@/services/client/client-profile.service";
import { getJobs } from "@/repositories/jobs.repository";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, MapPin } from "lucide-react";
import { JobFilters } from "@/components/jobs/job-filters";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; roleType?: string }>;
}) {
  const { clientProfile } = await requireActiveClientHr();
  const p = await searchParams;
  console.log("CLIENT JOBS PAGE: Fetching jobs for company:", clientProfile.company_id);
  const r = await getJobs({ 
    companyId: clientProfile.company_id,
    search: p.search,
    status: p.status,
    roleType: p.roleType,
  });
  
  return (
    <main className="p-8">
      <PageHeader 
        title="Jobs" 
        description="Your company requisitions."
        actions={
          <Link href="/client/jobs/new">
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
              href={`/client/jobs/${j.id}`}
              key={j.id}
              className="group flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <Badge variant={statusVariant} className="capitalize">{j.status.replace('_', ' ')}</Badge>
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {j.job_title}
                </h3>
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground line-clamp-1">
                  <MapPin className="h-3 w-3" />
                  {j.location ?? "Location TBD"}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs font-medium text-muted-foreground">
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
