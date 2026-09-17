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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50">
              <tr>
                <th className="px-5 py-4 font-medium text-muted-foreground">Candidate</th>
                <th className="px-5 py-4 font-medium text-muted-foreground">Job</th>
                <th className="px-5 py-4 font-medium text-muted-foreground">Round & Mode</th>
                <th className="px-5 py-4 font-medium text-muted-foreground">Date</th>
                <th className="px-5 py-4 font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-4 font-medium text-right text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
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
                  <tr key={interview.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-4 font-medium text-foreground">
                      {String(snapshot?.candidate_name ?? "Candidate")}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{job?.job_title ?? "—"}</td>
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
                      <Link href={`/client/interviews/${interview.id}`}>
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
