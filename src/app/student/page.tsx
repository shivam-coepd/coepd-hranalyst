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
            <p className="text-sm text-muted-foreground">Your recent job applications will appear here.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No upcoming interviews scheduled.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
