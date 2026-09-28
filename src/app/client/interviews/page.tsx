import Link from "next/link";
import { requireActiveClientHr } from "@/services/client/client-profile.service";
import { getClientInterviews } from "@/repositories/interviews.repository";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InterviewFilters } from "@/components/interviews/interview-filters";

export default async function ClientInterviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; mode?: string }>;
}) {
  const { clientProfile } = await requireActiveClientHr();
  const p = await searchParams;
  const interviews = await getClientInterviews(clientProfile.company_id, {
    search: p.search,
    status: p.status,
    mode: p.mode,
  });

  return (
    <div className="p-8">
      <PageHeader 
        title="Interviews" 
        description="Track upcoming and completed candidate interviews."
      />

      <Card>
        <InterviewFilters
          defaultSearch={p.search}
          defaultStatus={p.status}
          defaultMode={p.mode}
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
          {interviews.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
              No interviews scheduled.
            </div>
          )}
          {interviews.map((interview) => {
            const candidate = Array.isArray(interview.submission_candidates)
              ? interview.submission_candidates[0]
              : interview.submission_candidates;

            const snapshot = candidate?.candidate_snapshot as Record<string, unknown> | undefined;
            const job = Array.isArray(interview.jobs) ? interview.jobs[0] : interview.jobs;

            let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
            if (interview.status === "scheduled") statusVariant = "pending";
            if (interview.status === "completed") statusVariant = "success";
            if (interview.status === "cancelled") statusVariant = "destructive";

            return (
              <Link
                key={interview.id}
                href={`/client/interviews/${interview.id}`}
                className="group flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary dark:bg-indigo-900/50 dark:text-indigo-400">
                      <span className="font-semibold text-lg">I</span>
                    </div>
                    <Badge variant={statusVariant} className="capitalize">{interview.status}</Badge>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {String(snapshot?.candidate_name ?? "Candidate")}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                    {interview.round_name} • {job?.job_title ?? "—"}
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>
                    {new Date(interview.scheduled_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                  <span className="uppercase">{interview.mode}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
