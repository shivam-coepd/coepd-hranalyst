import Link from "next/link";
import { listScoringApplications } from "@/services/scoring/list-scoring-applications.service";
import { getVerificationQueue } from "@/services/verifications/get-verification.service";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default async function Page() {
  const [scoring, verification] = await Promise.all([
    listScoringApplications(),
    getVerificationQueue(),
  ]);
  const merged = [
    ...scoring.filter((r) => !["verification_pending", "under_verification"].includes(r.status)),
    ...verification.map((r) => ({
      ...r,
      verified_match_score: r.verified_match_score,
      verified_ats_score: r.verified_ats_score,
    })),
  ];

  return (
    <main className="p-8">
      <PageHeader 
        title="Application Verification Queue" 
        description="Scoring failures, pending scores and HR verification work in one queue."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {merged.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
            No applications awaiting action.
          </div>
        )}
        {merged.map((a) => {
          const j = Array.isArray(a.jobs) ? a.jobs[0] : a.jobs;
          const s = Array.isArray(a.student_profiles) ? a.student_profiles[0] : a.student_profiles;
          
          let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
          if (a.status === "verification_pending" || a.status === "under_verification") statusVariant = "pending";
          if (a.status === "scoring_failed") statusVariant = "destructive";

          return (
            <Link
              key={a.id}
              href={`/placement-hr/applications/${a.id}`}
              className="group flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <Badge variant={statusVariant} className="capitalize">{a.status.replaceAll('_', ' ')}</Badge>
                </div>
                
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {s?.first_name} {s?.last_name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                  {s?.enrollment_id} · {j?.job_title}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Code: {j?.job_code}</span>
                <span className="flex gap-2">
                  <span className="text-primary font-semibold">Match: {a.verified_match_score ?? a.match_score ?? "—"}%</span>
                  <span className="text-secondary-foreground font-semibold">ATS: {a.verified_ats_score ?? a.ats_score ?? "—"}%</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
