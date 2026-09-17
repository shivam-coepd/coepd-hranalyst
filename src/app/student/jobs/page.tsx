import Link from "next/link";
import { getStudentJobFeed } from "@/repositories/student-jobs.repository";
import { requireRole } from "@/lib/auth/guards";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Briefcase, MapPin, Building2, ExternalLink } from "lucide-react";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireRole("student");
  const q = await searchParams;
  const r = await getStudentJobFeed({
    search: q.q,
    roleType: q.role,
    workplaceType: q.workplace,
  });

  return (
    <main className="p-8">
      <PageHeader 
        title="Live Jobs" 
        description="Find and apply for opportunities matching your profile."
      />

      <form className="mt-8 flex flex-col md:flex-row gap-3 rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-950">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full rounded-md border-0 bg-slate-50 px-9 py-2.5 text-sm outline-none ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-900 dark:ring-slate-800"
            name="q"
            placeholder="Search title, location, or code..."
            defaultValue={q.q}
          />
        </div>
        <select
          className="rounded-md border-0 bg-slate-50 px-4 py-2.5 text-sm outline-none ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-900 dark:ring-slate-800"
          name="role"
          defaultValue={q.role ?? ""}
        >
          <option value="">All roles</option>
          <option>BA</option>
          <option>PO</option>
          <option>PM</option>
          <option>SM</option>
        </select>
        <select
          className="rounded-md border-0 bg-slate-50 px-4 py-2.5 text-sm outline-none ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-slate-900 dark:ring-slate-800"
          name="workplace"
          defaultValue={q.workplace ?? ""}
        >
          <option value="">All workplaces</option>
          <option value="onsite">Onsite</option>
          <option value="hybrid">Hybrid</option>
          <option value="remote">Remote</option>
        </select>
        <Button type="submit">Filter Jobs</Button>
      </form>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {r.jobs.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
            No live jobs found matching your criteria.
          </div>
        )}
        {r.jobs.map((j) => (
          <Link
            key={j.id}
            href={`/student/jobs/${j.id}`}
            className="group flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                  <Briefcase className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="shrink-0 bg-slate-50">Match after apply</Badge>
              </div>
              
              <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {j.job_title}
              </h2>
              
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="line-clamp-1 font-medium">{j.companies?.name ?? "Confidential Company"}</span>
                  <span>•</span>
                  <span>{j.job_code}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="line-clamp-1">{j.location ?? "Location TBD"}</span>
                  <span>•</span>
                  <span className="capitalize">{j.workplace_type}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 border-t pt-4">
              <div className="flex flex-wrap gap-2">
                {((j.job_checklists?.[0]?.top_3_skills ?? []) as string[]).slice(0, 3).map((s: string) => (
                  <span key={s} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-end text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                View Details <ExternalLink className="ml-1 h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
