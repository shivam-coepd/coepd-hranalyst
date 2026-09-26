import { requireRole } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  listAvailableMockSlots,
  listStudentMockApplications,
  listStudentMocks,
} from "@/repositories/mocks.repository";
import { StudentBookingPanel } from "@/components/mocks/student-booking-panel";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Video, MapPin, Calendar, ClipboardCheck } from "lucide-react";

export default async function Page() {
  const user = await requireRole("student");
  const { data: studentProfile } = await supabaseAdmin
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!studentProfile) throw new Error("Student profile not found");

  const [applications, slots, mocks] = await Promise.all([
    listStudentMockApplications(studentProfile.id),
    listAvailableMockSlots(),
    listStudentMocks(studentProfile.id),
  ]);

  return (
    <main className="p-8">
      <PageHeader 
        title="Mock Interviews" 
        description="Book an available mock and review submitted scorecards."
      />

      <div className="mt-8 space-y-12">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Available slots</h2>
            <Badge variant="outline" className="font-normal">{slots.length} available</Badge>
          </div>
          <StudentBookingPanel applications={applications as any} slots={slots as any} />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">My mocks</h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {mocks.map((mock) => {
              const job = Array.isArray(mock.applications?.jobs)
                ? mock.applications.jobs[0]
                : mock.applications?.jobs;

              const rawSc = mock.mock_scorecards;
              const scList = Array.isArray(rawSc) ? rawSc : (rawSc ? [rawSc] : []);
              const cards = [...scList].sort(
                (a: any, b: any) =>
                  parseInt(b.scoring_version || "0") -
                  parseInt(a.scoring_version || "0"),
              );
              const scorecard = cards.find((x) => x.status === "submitted");

              let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
              if (mock.status === "scheduled") statusVariant = "pending";
              if (mock.status === "completed") statusVariant = "success";
              if (mock.status === "cancelled") statusVariant = "destructive";

              return (
                <Card key={mock.id} className="flex flex-col justify-between p-6 shadow-sm">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary dark:bg-indigo-900/50 dark:text-indigo-400">
                          <ClipboardCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold tracking-tight text-foreground line-clamp-1">{job?.job_title}</h3>
                          <div className="text-sm text-muted-foreground mt-0.5">Code: {mock.mock_code}</div>
                        </div>
                      </div>
                      <Badge variant={statusVariant} className="capitalize shrink-0">{mock.status.replaceAll("_", " ")}</Badge>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{new Date(mock.scheduled_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground capitalize">
                        {mock.mode === "online" ? <Video className="h-4 w-4 text-primary" /> : <MapPin className="h-4 w-4 text-primary" />}
                        <span>{mock.mode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 flex gap-2">
                    {mock.mode === "online" && mock.meeting_link && (
                      <a 
                        href={mock.meeting_link} 
                        target="_blank" 
                        rel="noreferrer"
                        className={buttonVariants({ variant: "default", className: "w-full" })}
                      >
                        <Video className="mr-2 h-4 w-4" /> Join Mock
                      </a>
                    )}
                    {mock.mode === "offline" && mock.location && (
                      <div className="w-full rounded-md bg-slate-100 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span><strong>Location:</strong> {mock.location}</span>
                      </div>
                    )}
                  </div>

                  {scorecard && (
                    <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-100 p-4 dark:bg-emerald-950/20 dark:border-emerald-900/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-emerald-900 dark:text-emerald-100">Overall Score</div>
                        <div className="font-bold text-xl text-emerald-700 dark:text-emerald-400">{scorecard.overall_score}/100</div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs font-medium text-emerald-800/80 dark:text-emerald-200/80 mb-3 text-center">
                        <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded py-1">Comm: {scorecard.communication_score}</div>
                        <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded py-1">Tech: {scorecard.technical_score}</div>
                        <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded py-1">Domain: {scorecard.domain_score}</div>
                      </div>
                      
                      {scorecard.student_visible_notes && (
                        <div className="text-sm text-emerald-800 dark:text-emerald-200 mb-3 italic">
                          &ldquo;{scorecard.student_visible_notes}&rdquo;
                        </div>
                      )}
                      
                      <div className="text-xs font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center">
                        <span className="mr-2">Recommendation:</span>
                        <Badge variant="outline" className="border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400">
                          {scorecard.recommendation.replaceAll("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
            {mocks.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
                No mocks yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
