import { requireRole } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getStudentInterviews } from "@/repositories/interviews.repository";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Calendar, Video, MapPin, Clock, Building2 } from "lucide-react";

import { Card } from "@/components/ui/card";

export default async function StudentInterviewsPage() {
  const user = await requireRole(["student"]);

  const { data: studentProfile, error } = await supabaseAdmin
    .from("student_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (error || !studentProfile) {
    throw new Error("Student profile not found");
  }

  const interviews = await getStudentInterviews(studentProfile.id);

  return (
    <div className="p-8">
      <PageHeader 
        title="My Interviews" 
        description="View scheduled client interview rounds."
      />

      <Card className="mt-8">
      <div className="grid gap-4 md:grid-cols-2 p-4">
        {interviews.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
            No interviews scheduled.
          </div>
        )}
        
        {interviews.map((interview) => {
          const company = Array.isArray(interview.companies) ? interview.companies[0] : interview.companies;
          const job = Array.isArray(interview.jobs) ? interview.jobs[0] : interview.jobs;

          let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
          if (interview.status === "scheduled") statusVariant = "pending";
          if (interview.status === "completed") statusVariant = "success";
          if (interview.status === "cancelled") statusVariant = "destructive";

          return (
            <div key={interview.id} className="flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary dark:bg-indigo-900/50 dark:text-indigo-400">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        {company?.name ?? "Company"}
                      </div>
                      <h2 className="text-lg font-bold tracking-tight text-foreground line-clamp-1">
                        {job?.job_title}
                      </h2>
                    </div>
                  </div>
                  <Badge variant={statusVariant} className="capitalize shrink-0">{interview.status}</Badge>
                </div>

                <div className="mt-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-900/50">
                  <div className="font-medium text-foreground mb-3">{interview.round_name}</div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{new Date(interview.scheduled_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{new Date(interview.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{interview.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground capitalize">
                      {interview.mode === "online" ? <Video className="h-4 w-4 text-primary" /> : <MapPin className="h-4 w-4 text-primary" />}
                      <span>{interview.mode}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 flex gap-2">
                {interview.mode === "online" && interview.meeting_link && (
                  <a 
                    href={interview.meeting_link} 
                    target="_blank" 
                    rel="noreferrer"
                    className={buttonVariants({ variant: "default", className: "w-full" })}
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Join Interview
                  </a>
                )}

                {interview.mode === "offline" && interview.location && (
                  <div className="w-full rounded-md bg-slate-100 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span><strong>Location:</strong> {interview.location}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </Card>
    </div>
  );
}
