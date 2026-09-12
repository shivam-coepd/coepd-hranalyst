import Link from "next/link";
import { getStudentDashboard } from "@/services/students/dashboard.service";
export default async function Page() {
  const d = await getStudentDashboard();
  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-3xl font-bold">Student Dashboard</h1>
      <p className="mt-1 text-slate-600">
        Enrollment {d.student.enrollment_id} · {d.student.verification_status}
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          ["Profile", `${d.student.profile_completion}%`, `/student/profile`],
          ["CVs", d.cvCount, "/student/cv"],
          ["Applications", d.applicationCount, "/student/applications"],
          ["Live jobs", d.publishedJobs, "/student/jobs"],
        ].map(([a, b, h]) => (
          <Link key={a} href={h as string} className="rounded-xl border p-5">
            <div className="text-sm text-slate-500">{a}</div>
            <div className="mt-2 text-2xl font-bold">{b}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
