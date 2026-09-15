import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { listPlacementSubmissions } from "@/repositories/submissions.repository";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Briefcase } from "lucide-react";

export default async function Page() {
  const user = await requireRole(["placement_hr", "admin", "super_admin"]);
  const rows = await listPlacementSubmissions(
    user.id,
    user.roles.some((r) => r === "admin" || r === "super_admin"),
  );

  return (
    <div className="p-8">
      <PageHeader 
        title="Client Submissions" 
        description="Verified candidates submitted to Client HR."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rows.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
            No submissions found.
          </div>
        )}
        {rows.map((r) => {
          let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
          if (r.status === "submitted") statusVariant = "pending";
          if (r.status === "shortlisted" || r.status === "selected") statusVariant = "success";
          if (r.status === "rejected") statusVariant = "destructive";

          return (
            <Link
              key={r.id}
              href={`/placement-hr/submissions/${r.id}`}
              className="group flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <Badge variant={statusVariant} className="capitalize">{r.status}</Badge>
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {r.submission_code}
                </h3>
              </div>
              
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="line-clamp-1">{r.jobs?.job_title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="line-clamp-1">{r.companies?.name}</span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t mt-2 font-medium">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{r.candidate_count} candidates</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
