import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InterviewFilters } from "@/components/interviews/interview-filters";

export default async function PlacementHrInterviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; mode?: string }>;
}) {
  const user = await requireRole(["placement_hr", "admin", "super_admin"]);
  const p = await searchParams;

  let query = supabaseAdmin
    .from("interviews")
    .select(
      `
        id,
        interview_code,
        round_name,
        scheduled_at,
        mode,
        status,

        jobs!inner (
          job_title,
          assigned_placement_hr
        ),

        companies (
          name
        ),

        submission_candidates (
          candidate_snapshot
        )
      `,
    )
    .is("deleted_at", null);

  if (!user.roles.some((role) => role === "admin" || role === "super_admin")) {
    query = query.eq("jobs.assigned_placement_hr", user.id);
  }

  if (p.status) {
    query = query.eq("status", p.status);
  }

  if (p.mode) {
    query = query.eq("mode", p.mode);
  }

  if (p.search?.trim()) {
    const term = p.search.trim();
    // Since candidate_name is inside a JSONB column `candidate_snapshot`, doing ilike on JSONB text representation 
    // or related tables is required. We'll search by interview_code, companies.name or round_name
    query = query.or(
      `interview_code.ilike.%${term}%,round_name.ilike.%${term}%`
    );
  }

  const { data, error } = await query.order("scheduled_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const interviews = data ?? [];

  return (
    <div className="p-8">
      <PageHeader 
        title="Client Interviews" 
        description="Monitor all scheduled candidate interviews."
      />

      <Card>
        <InterviewFilters
          defaultSearch={p.search}
          defaultStatus={p.status}
          defaultMode={p.mode}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50">
              <tr>
                <th className="px-5 py-3 font-medium text-muted-foreground">Candidate</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Company & Job</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Round & Mode</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Schedule</th>
                <th className="px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3 font-medium text-right text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {interviews.map((interview) => {
                const candidate = Array.isArray(interview.submission_candidates)
                  ? interview.submission_candidates[0]
                  : interview.submission_candidates;

                const snapshot = candidate?.candidate_snapshot as Record<string, unknown> | undefined;
                const company = Array.isArray(interview.companies) ? interview.companies[0] : interview.companies;
                const job = Array.isArray(interview.jobs) ? interview.jobs[0] : interview.jobs;

                let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
                if (interview.status === "scheduled") statusVariant = "pending";
                if (interview.status === "completed") statusVariant = "success";
                if (interview.status === "cancelled") statusVariant = "destructive";

                return (
                  <tr key={interview.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-4 font-medium text-foreground">
                      {String(snapshot?.candidate_name ?? "Candidate")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium">{company?.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{job?.job_title}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium">{interview.round_name}</div>
                      <div className="text-xs text-muted-foreground uppercase">{interview.mode}</div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {new Date(interview.scheduled_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={statusVariant} className="capitalize">{interview.status}</Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/placement-hr/interviews/${interview.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {interviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    No interviews scheduled.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
