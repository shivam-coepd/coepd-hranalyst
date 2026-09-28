import Link from "next/link";
import { getStudentDashboard } from "@/services/students/dashboard.service";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { User, FileText, Send, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page() {
  const d = await getStudentDashboard();

  let verificationVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
  if (d.student.verification_status === "verified") verificationVariant = "success";
  if (d.student.verification_status === "pending") verificationVariant = "pending";

  return (
    <main className="p-8">
      <PageHeader 
        title="Student Dashboard" 
        description={
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span>Enrollment ID: {d.student.enrollment_id}</span>
            <span className="text-slate-300">•</span>
            <Badge variant={verificationVariant} className="capitalize">
              {d.student.verification_status}
            </Badge>
          </div>
        }
      />

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/student/profile" className="group block">
          <StatCard
            title="Profile Completion"
            value={`${d.student.profile_completion}%`}
            icon={User}
            className="group-hover:shadow-md transition-all group-hover:border-primary/20"
          />
        </Link>
        <Link href="/student/cv" className="group block">
          <StatCard
            title="CVs Uploaded"
            value={d.cvCount}
            icon={FileText}
            className="group-hover:shadow-md transition-all group-hover:border-primary/20"
          />
        </Link>
        <Link href="/student/applications" className="group block">
          <StatCard
            title="Applications"
            value={d.applicationCount}
            icon={Send}
            className="group-hover:shadow-md transition-all group-hover:border-primary/20"
          />
        </Link>
        <Link href="/student/jobs" className="group block">
          <StatCard
            title="Live Jobs"
            value={d.publishedJobs}
            icon={Briefcase}
            className="group-hover:shadow-md transition-all group-hover:border-primary/20"
          />
        </Link>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {d.recentApplications.length === 0 ? (
              <p className="text-sm text-muted-foreground">Your recent job applications will appear here.</p>
            ) : (
              <ul className="space-y-4">
                {d.recentApplications.map((app: any) => {
                  const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
                  return (
                    <li key={app.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                      <span className="font-medium">{job?.job_title}</span>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="capitalize">{app.status}</span>
                        <span>{new Date(app.created_at).toLocaleDateString()}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {d.upcomingInterviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming interviews scheduled.</p>
            ) : (
              <ul className="space-y-4">
                {d.upcomingInterviews.map((int: any) => {
                  const app = Array.isArray(int.applications) ? int.applications[0] : int.applications;
                  const job = app && (Array.isArray(app.jobs) ? app.jobs[0] : app.jobs);
                  return (
                    <li key={int.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                      <span className="font-medium">{job?.job_title} - Round {int.round_number}</span>
                      <div className="text-xs text-muted-foreground">
                        {new Date(int.scheduled_at).toLocaleString()}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
